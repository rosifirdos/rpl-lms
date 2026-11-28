import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { ROLES } from '../../constants/roles.js';
import { OWNERSHIP_MESSAGES, getStudentRecordOrThrow, getLecturerRecordOrThrow } from '../../utils/ownership.js';
import {
  TIMELINE_TYPES,
  TIMELINE_TYPE_VALUES,
  TIMELINE_DEFAULT_WINDOW_DAYS,
  TIMELINE_LIMITS,
  TIMELINE_ITEM_STATUS,
} from '../../constants/timeline.js';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Layanan Central Timeline (FR-009–FR-012, BR-013).
 *
 * Mengagregasi empat jenis item kronologis — deadline tugas, jadwal kuis,
 * pertemuan rutin, dan UTS/UAS — untuk mahasiswa (kelas yang dienroll) dan
 * dosen (kelas yang diampu). Seluruh perbandingan waktu memakai waktu server.
 */
export class TimelineService {
  /**
   * Selesaikan daftar ID kelas yang dapat dilihat pengguna.
   *
   * @param {object} user pengguna terautentikasi
   * @returns {Promise<string[]>}
   */
  static async #resolveAccessibleClassIds(user) {
    if (user.role === ROLES.MAHASISWA) {
      const student = await getStudentRecordOrThrow(user.id);
      const enrollments = await prisma.enrollment.findMany({
        where: { student_id: student.id },
        select: { class_id: true },
      });
      return enrollments.map((enrollment) => enrollment.class_id);
    }

    if (user.role === ROLES.DOSEN) {
      const lecturer = await getLecturerRecordOrThrow(user.id);
      const classes = await prisma.class.findMany({
        where: { lecturer_id: lecturer.id },
        select: { id: true },
      });
      return classes.map((classRow) => classRow.id);
    }

    throw new AppError(OWNERSHIP_MESSAGES.ROLE_NOT_ALLOWED, 403);
  }

  /**
   * Hitung status item relatif terhadap waktu server (BR-013).
   *
   * @param {string} type jenis item timeline
   * @param {Date} startsAt awal item
   * @param {Date|null} endsAt akhir item (kuis saja)
   * @param {Date} now waktu server
   * @returns {string}
   */
  static #computeStatus(type, startsAt, endsAt, now) {
    if (type === TIMELINE_TYPES.ASSIGNMENT) {
      return startsAt >= now ? TIMELINE_ITEM_STATUS.UPCOMING : TIMELINE_ITEM_STATUS.OVERDUE;
    }
    if (type === TIMELINE_TYPES.QUIZ) {
      if (endsAt && endsAt < now) return TIMELINE_ITEM_STATUS.PAST;
      if (startsAt <= now) return TIMELINE_ITEM_STATUS.ONGOING;
      return TIMELINE_ITEM_STATUS.UPCOMING;
    }
    return startsAt >= now ? TIMELINE_ITEM_STATUS.UPCOMING : TIMELINE_ITEM_STATUS.PAST;
  }

  /**
   * Kumpulkan item tugas (deadline) untuk jendela waktu.
   */
  static async #collectAssignmentItems({ classIds, from, to, now, studentId }) {
    const assignments = await prisma.assignment.findMany({
      where: {
        meeting: { class_id: { in: classIds } },
        is_published: true,
        due_date: { gte: from, lte: to },
      },
      include: {
        meeting: {
          select: {
            id: true,
            meeting_number: true,
            class: {
              select: {
                id: true,
                name: true,
                course: { select: { code: true, name: true } },
              },
            },
          },
        },
        ...(studentId
          ? { submissions: { where: { student_id: studentId }, select: { submitted_at: true, is_late: true, score: true, graded_at: true } } }
          : {}),
      },
    });

    return assignments.map((assignment) => {
      const submission = studentId ? assignment.submissions?.[0] ?? null : null;
      let submissionStatus = 'NOT_SUBMITTED';
      if (submission) {
        if (submission.graded_at !== null && submission.score !== null) submissionStatus = 'GRADED';
        else if (submission.is_late) submissionStatus = 'LATE';
        else submissionStatus = 'SUBMITTED';
      }

      return {
        id: assignment.id,
        type: TIMELINE_TYPES.ASSIGNMENT,
        title: assignment.title,
        starts_at: assignment.due_date,
        ends_at: null,
        class_id: assignment.meeting.class.id,
        class_name: assignment.meeting.class.name,
        course_code: assignment.meeting.class.course.code,
        course_name: assignment.meeting.class.course.name,
        meeting_number: assignment.meeting.meeting_number,
        link: `/classes/${assignment.meeting.class.id}/assignments/${assignment.id}`,
        status: this.#computeStatus(TIMELINE_TYPES.ASSIGNMENT, assignment.due_date, null, now),
        meta: studentId ? { submission_status: submissionStatus } : { submission_count: undefined },
      };
    });
  }

  /**
   * Kumpulkan item kuis (jendela open–close) untuk jendela waktu.
   */
  static async #collectQuizItems({ classIds, from, to, now, studentId }) {
    const quizzes = await prisma.quiz.findMany({
      where: {
        meeting: { class_id: { in: classIds } },
        is_published: true,
        open_at: { lte: to },
        close_at: { gte: from },
      },
      include: {
        meeting: {
          select: {
            id: true,
            meeting_number: true,
            class: {
              select: {
                id: true,
                name: true,
                course: { select: { code: true, name: true } },
              },
            },
          },
        },
        ...(studentId
          ? { attempts: { where: { student_id: studentId }, select: { status: true, score: true } } }
          : {}),
      },
    });

    return quizzes.map((quiz) => {
      const attempt = studentId ? quiz.attempts?.[0] ?? null : null;

      return {
        id: quiz.id,
        type: TIMELINE_TYPES.QUIZ,
        title: quiz.title,
        starts_at: quiz.open_at,
        ends_at: quiz.close_at,
        class_id: quiz.meeting.class.id,
        class_name: quiz.meeting.class.name,
        course_code: quiz.meeting.class.course.code,
        course_name: quiz.meeting.class.course.name,
        meeting_number: quiz.meeting.meeting_number,
        link: `/classes/${quiz.meeting.class.id}/quizzes/${quiz.id}`,
        status: this.#computeStatus(TIMELINE_TYPES.QUIZ, quiz.open_at, quiz.close_at, now),
        meta: studentId
          ? {
              attempt_status: attempt?.status ?? null,
              score: attempt?.score != null ? Number(attempt.score) : null,
            }
          : {},
      };
    });
  }

  /**
   * Kumpulkan item pertemuan (rutin & ujian) yang sudah dijadwalkan.
   */
  static async #collectMeetingItems({ classIds, from, to, now }) {
    const meetings = await prisma.meeting.findMany({
      where: {
        class_id: { in: classIds },
        scheduled_at: { gte: from, lte: to },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            course: { select: { code: true, name: true } },
          },
        },
      },
    });

    return meetings.map((meeting) => {
      const type = meeting.is_exam ? TIMELINE_TYPES.EXAM : TIMELINE_TYPES.MEETING;
      return {
        id: meeting.id,
        type,
        title: meeting.title,
        starts_at: meeting.scheduled_at,
        ends_at: null,
        class_id: meeting.class.id,
        class_name: meeting.class.name,
        course_code: meeting.class.course.code,
        course_name: meeting.class.course.name,
        meeting_number: meeting.meeting_number,
        link: `/classes/${meeting.class.id}/meetings`,
        status: this.#computeStatus(type, meeting.scheduled_at, null, now),
        meta: meeting.is_exam ? { exam_type: meeting.exam_type } : {},
      };
    });
  }

  /**
   * Timeline kronologis untuk pengguna (FR-009–FR-012).
   *
   * @param {object} params
   * @param {object} params.user pengguna terautentikasi
   * @param {object} params.query query tervalidasi Zod
   * @returns {Promise<{items: object[], window: object}>}
   */
  static async getTimeline({ user, query }) {
    const now = new Date();
    const from = query.from ? new Date(query.from) : now;
    const to = query.to
      ? new Date(query.to)
      : new Date(now.getTime() + TIMELINE_DEFAULT_WINDOW_DAYS * MILLISECONDS_PER_DAY);
    const limit = query.limit ?? TIMELINE_LIMITS.DEFAULT;
    const types = query.types?.length ? query.types : [...TIMELINE_TYPE_VALUES];

    const classIds = await this.#resolveAccessibleClassIds(user);

    // Filter kelas spesifik wajib termasuk dalam cakupan akses pengguna.
    if (query.class_id) {
      if (!classIds.includes(query.class_id)) {
        throw new AppError(OWNERSHIP_MESSAGES.NOT_ENROLLED, 403);
      }
    }
    const effectiveClassIds = query.class_id ? [query.class_id] : classIds;

    const studentId =
      user.role === ROLES.MAHASISWA
        ? (await prisma.mahasiswa.findUnique({ where: { user_id: user.id }, select: { id: true } }))?.id ?? null
        : null;

    const collectors = [];
    if (effectiveClassIds.length > 0) {
      if (types.includes(TIMELINE_TYPES.ASSIGNMENT)) {
        collectors.push(this.#collectAssignmentItems({ classIds: effectiveClassIds, from, to, now, studentId }));
      }
      if (types.includes(TIMELINE_TYPES.QUIZ)) {
        collectors.push(this.#collectQuizItems({ classIds: effectiveClassIds, from, to, now, studentId }));
      }
      if (types.includes(TIMELINE_TYPES.MEETING) || types.includes(TIMELINE_TYPES.EXAM)) {
        collectors.push(
          this.#collectMeetingItems({ classIds: effectiveClassIds, from, to, now }).then((items) =>
            items.filter((item) => types.includes(item.type))
          )
        );
      }
    }

    const nested = await Promise.all(collectors);
    const items = nested
      .flat()
      .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
      .slice(0, limit)
      .map((item) => ({
        ...item,
        starts_at: item.starts_at.toISOString(),
        ends_at: item.ends_at ? item.ends_at.toISOString() : null,
      }));

    return {
      items,
      window: {
        from: from.toISOString(),
        to: to.toISOString(),
        server_time: now.toISOString(),
      },
    };
  }
}
