import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { NotificationType } from '../../constants/notifications.js';
import { ROLES } from '../../constants/roles.js';
import { buildDeadlineReminderNotification } from './notification.templates.js';

/** Jendela pengingat deadline: tugas yang berakhir dalam 24 jam ke depan. */
const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Suffix dedupe key pengingat harian. */
const DEADLINE_DEDUPE_SUFFIX = '24h';

/**
 * Jeda minimum antar eksekusi materialisasi pengingat per proses (R-03).
 *
 * Materialisasi bersifat lazy (tanpa scheduler — keputusan MVP 4), sehingga
 * frontend yang melakukan polling dapat memicunya berkali-kali. Throttle
 * in-memory membatasi eksekusi maksimal sekali per 60 detik per proses.
 * Catatan: pada deployment multi-instance, batas ini berlaku per instance;
 * alternatif jangka panjang adalah job terjadwal (automation/cron) di luar
 * cakupan MVP 4.
 */
const REMINDER_THROTTLE_MS = 60 * 1000;

/**
 * Layanan notifikasi internal (FR-057).
 *
 * Notifikasi bersifat **best-effort**: kegagalan penulisan notifikasi TIDAK
 * PERNAH menggagalkan aksi utama yang memicunya. Seluruh metode penulisan
 * menelan galat internal dan hanya mencatatnya ke log server.
 *
 * Dedupe: bila `dedupeKey` diberikan, kombinasi `(user_id, dedupe_key)` unik
 * sehingga pemicu berulang tidak menggandakan notifikasi.
 */
export class NotificationService {
  /**
   * Kirim satu notifikasi (best-effort).
   *
   * @param {object} params
   * @param {string} params.userId penerima
   * @param {string} params.type salah satu `NotificationType`
   * @param {string} params.title judul
   * @param {string} params.message isi
   * @param {string} [params.link] tautan dalam aplikasi
   * @param {string} [params.dedupeKey] kunci dedupe per pengguna
   */
  static async notify({ userId, type, title, message, link = null, dedupeKey = null }) {
    try {
      await prisma.notification.create({
        data: {
          user_id: userId,
          type,
          title,
          message,
          link,
          dedupe_key: dedupeKey,
        },
      });
    } catch (error) {
      // Duplikasi (dedupe) dianggap sukses; galat lain hanya dicatat.
      if (error?.code !== 'P2002') {
        console.error('[NotificationService] Gagal menulis notifikasi:', error.message);
      }
    }
  }

  /**
   * Kirim notifikasi ke banyak pengguna sekaligus (best-effort).
   *
   * @param {object} params
   * @param {string[]} params.userIds daftar penerima
   * @param {string} params.type tipe notifikasi
   * @param {(userIndex: number) => {title: string, message: string, link?: string|null}} [params.build]
   *        builder opsional per penerima; default memakai `title`/`message`/`link` bersama.
   * @param {string} [params.title]
   * @param {string} [params.message]
   * @param {string} [params.link]
   * @param {(userId: string) => string} [params.dedupeKeyFor] kunci dedupe per penerima
   */
  static async notifyMany({ userIds, type, title, message, link = null, build, dedupeKeyFor }) {
    if (!userIds || userIds.length === 0) return;

    try {
      const data = userIds.map((userId, index) => {
        const payload = build ? build(index) : { title, message, link };
        return {
          user_id: userId,
          type,
          title: payload.title ?? title,
          message: payload.message ?? message,
          link: payload.link ?? link,
          dedupe_key: dedupeKeyFor ? dedupeKeyFor(userId) : null,
        };
      });

      await prisma.notification.createMany({ data, skipDuplicates: true });
    } catch (error) {
      console.error('[NotificationService] Gagal menulis notifikasi massal:', error.message);
    }
  }

  /**
   * ID pengguna seluruh mahasiswa ter-enroll pada sebuah kelas.
   *
   * @param {string} classId
   * @returns {Promise<string[]>}
   */
  static async getEnrolledStudentUserIds(classId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { class_id: classId },
      select: {
        student: {
          select: { user: { select: { id: true } } },
        },
      },
    });
    return enrollments.map((enrollment) => enrollment.student.user.id);
  }

  /**
   * Materialisasi lazy pengingat deadline H-1 (FR-057, tanpa scheduler).
   *
   * Dipanggil saat daftar notifikasi / unread-count diminta, **hanya untuk
   * peran MAHASISWA** (R-03): tugas terbit dengan `due_date` dalam 24 jam ke
   * depan pada kelas yang **dienroll mahasiswa pemanggil** dan belum
   * dikumpulkan olehnya dibuatkan notifikasi ber-dedupe.
   *
   * Throttle in-memory membatasi eksekusi maksimal sekali per
   * `REMINDER_THROTTLE_MS` per proses; `{ force: true }` melewatkannya untuk
   * keperluan pengujian. Pemanggil oleh dosen/Admin tidak pernah memicu
   * materialisasi.
   *
   * @param {object} [params]
   * @param {object} [params.user] pengguna pemanggil (`req.user`)
   * @param {boolean} [params.force] lewati throttle (untuk pengujian)
   */
  static async materializeDeadlineReminders({ user, force = false } = {}) {
    // Hanya mahasiswa yang memicu materialisasi; dosen/Admin tidak pernah
    // memindai tugas hanya karena membuka notifikasi (R-03).
    if (user?.role !== ROLES.MAHASISWA) return;

    // Throttle per proses: polling beruntun tidak boleh memindai berulang.
    const nowMs = Date.now();
    if (!force && nowMs - this.#reminderState.lastRunAt < REMINDER_THROTTLE_MS) return;
    this.#reminderState.lastRunAt = nowMs;

    try {
      const now = new Date();
      const windowEnd = new Date(nowMs + REMINDER_WINDOW_MS);

      // Scope ke kelas mahasiswa pemanggil — bukan seluruh database.
      const student = await prisma.mahasiswa.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      });
      if (!student) return;

      const enrollments = await prisma.enrollment.findMany({
        where: { student_id: student.id },
        select: { class_id: true },
      });
      const classIds = enrollments.map((enrollment) => enrollment.class_id);
      if (classIds.length === 0) return;

      const assignments = await prisma.assignment.findMany({
        where: {
          is_published: true,
          due_date: { gte: now, lte: windowEnd },
          meeting: { class_id: { in: classIds } },
        },
        select: {
          id: true,
          title: true,
          due_date: true,
          meeting: { select: { class_id: true } },
        },
      });

      for (const assignment of assignments) {
        const submission = await prisma.submission.findFirst({
          where: { assignment_id: assignment.id, student_id: student.id },
          select: { id: true },
        });
        if (submission) continue;

        const template = buildDeadlineReminderNotification({
          assignmentTitle: assignment.title,
          dueDate: assignment.due_date,
        });

        await this.notifyMany({
          userIds: [user.id],
          type: template.type,
          title: template.title,
          message: template.message,
          link: template.link,
          dedupeKeyFor: () => `deadline:${assignment.id}:${DEADLINE_DEDUPE_SUFFIX}`,
        });
      }
    } catch (error) {
      // Best-effort: kegagalan materialisasi tidak boleh menggagalkan
      // pembacaan notifikasi.
      console.error('[NotificationService] Gagal mematerialisasi pengingat deadline:', error.message);
    }
  }

  /** Keadaan throttle materialisasi (per proses). */
  static #reminderState = { lastRunAt: 0 };

  /**
   * Reset throttle materialisasi pengingat (hanya untuk pengujian).
   */
  static resetDeadlineReminderThrottle() {
    this.#reminderState.lastRunAt = 0;
  }

  /**
   * Daftar notifikasi milik pengguna (paginasi + filter).
   *
   * Materialisasi pengingat deadline hanya dijalankan untuk mahasiswa (R-03).
   */
  static async listNotifications({ userId, user, query = {} }) {
    await this.materializeDeadlineReminders({ user });

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(query.is_read !== undefined ? { is_read: query.is_read === 'true' } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        link: item.link,
        is_read: item.is_read,
        created_at: item.created_at.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /**
   * Jumlah notifikasi belum dibaca (materialisasi pengingat H-1 hanya untuk
   * mahasiswa — R-03).
   */
  static async getUnreadCount({ userId, user }) {
    await this.materializeDeadlineReminders({ user });
    return { unread_count: await prisma.notification.count({ where: { user_id: userId, is_read: false } }) };
  }

  /**
   * Tandai satu notifikasi milik pengguna sebagai dibaca.
   */
  static async markAsRead({ notificationId, userId }) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.user_id !== userId) {
      throw new AppError('Notifikasi tidak ditemukan', 404);
    }

    if (!notification.is_read) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
      });
    }

    return { id: notificationId, is_read: true };
  }

  /**
   * Tandai seluruh notifikasi pengguna sebagai dibaca.
   */
  static async markAllAsRead({ userId }) {
    const result = await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { updated: result.count };
  }
}
