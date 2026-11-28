import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { ROLES } from '../../constants/roles.js';
import {
  ensureCanManageClass,
  ensureCanReadClass,
  ensureEnrolledInClass,
  getStudentRecordOrThrow,
} from '../../utils/ownership.js';
import {
  QUIZ_QUESTION_TYPES,
  QUIZ_ATTEMPT_STATUS,
  roundQuizScore,
} from '../../constants/quiz.js';
import { NotificationService } from '../notifications/notification.service.js';
import { buildQuizPublishedNotification } from '../notifications/notification.templates.js';

/** Include standar untuk memuat rantai ownership kuis → pertemuan → kelas → dosen. */
const quizOwnershipInclude = {
  meeting: {
    include: {
      class: {
        include: {
          lecturer: true,
        },
      },
    },
  },
};

/** Include detail kuis beserta butir soal dan opsi (terurut). */
const quizDetailInclude = {
  meeting: {
    select: {
      id: true,
      meeting_number: true,
      class: {
        select: {
          id: true,
          name: true,
          course: { select: { id: true, code: true, name: true } },
          lecturer: { select: { id: true, user_id: true } },
        },
      },
    },
  },
  questions: {
    orderBy: { order_index: 'asc' },
    include: {
      options: { orderBy: { order_index: 'asc' } },
    },
  },
  _count: { select: { attempts: true } },
};

/**
 * Sanitizer butir soal untuk mahasiswa: kunci jawaban (`is_correct`,
 * `answer_key`) TIDAK PERNAH dikirim sebelum submission (FR-041, keamanan).
 */
function sanitizeQuestionForStudent(question) {
  return {
    id: question.id,
    question_text: question.question_text,
    type: question.type,
    points: Number(question.points),
    order_index: question.order_index,
    options: (question.options ?? []).map((option) => ({
      id: option.id,
      option_text: option.option_text,
      order_index: option.order_index,
    })),
  };
}

/**
 * Layanan manajemen kuis oleh Dosen pengampu/Admin (FR-025, FR-040–FR-041).
 */
export class QuizService {
  /**
   * Ambil kuis beserta rantai ownership, atau lempar 404.
   */
  static async #getQuizOrThrow(quizId, include = quizOwnershipInclude) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include,
    });
    if (!quiz) {
      throw new AppError('Kuis tidak ditemukan', 404);
    }
    return quiz;
  }

  /**
   * Pastikan pengguna berhak mengelola kuis (Dosen pengampu/Admin).
   */
  static #ensureCanManageQuiz(quiz, user) {
    ensureCanManageClass(quiz.meeting.class, user);
  }

  /**
   * Pastikan pengguna berhak membaca kuis (Dosen pengampu/Admin/ter-enroll).
   */
  static async #ensureCanReadQuiz(quiz, user) {
    await ensureCanReadClass({ user, classRecord: quiz.meeting.class, classId: quiz.meeting.class.id });
  }

  /**
   * Validasi kelengkapan kuis sebelum dapat diterbitkan.
   *
   * @throws {AppError} 400 bila belum layak terbit
   */
  static #assertPublishable(quiz) {
    if (!quiz.questions || quiz.questions.length === 0) {
      throw new AppError('Kuis minimal harus memiliki satu butir soal sebelum diterbitkan', 400);
    }

    const totalPoints = quiz.questions.reduce((sum, question) => sum + Number(question.points), 0);
    if (totalPoints <= 0) {
      throw new AppError('Total poin kuis harus lebih dari nol sebelum diterbitkan', 400);
    }

    for (const question of quiz.questions) {
      if (question.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE) {
        const correctCount = question.options.filter((option) => option.is_correct).length;
        if (correctCount !== 1) {
          throw new AppError(
            `Soal #${question.order_index} (pilihan ganda) wajib memiliki tepat satu kunci jawaban`,
            400
          );
        }
      }
    }

    if (new Date(quiz.close_at) <= new Date()) {
      throw new AppError('Kuis tidak dapat diterbitkan karena waktu tutup sudah lewat', 400);
    }
  }

  /**
   * Buat kuis baru pada pertemuan (FR-025). Kuis ditolak pada pertemuan ujian.
   */
  static async createQuiz({ meetingId, payload, user, ipAddress, userAgent }) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { class: { include: { lecturer: true } } },
    });
    if (!meeting) {
      throw new AppError('Pertemuan tidak ditemukan', 404);
    }

    ensureCanManageClass(meeting.class, user);

    if (meeting.is_exam) {
      throw new AppError('Kuis tidak dapat dibuat pada pertemuan ujian (UTS/UAS)', 400);
    }

    const quiz = await prisma.quiz.create({
      data: {
        meeting_id: meetingId,
        title: payload.title,
        instructions: payload.instructions ?? null,
        duration_minutes: payload.duration_minutes,
        open_at: new Date(payload.open_at),
        close_at: new Date(payload.close_at),
      },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'CREATE_QUIZ',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quiz.id,
      newValues: {
        meeting_id: meetingId,
        title: quiz.title,
        duration_minutes: quiz.duration_minutes,
        open_at: quiz.open_at,
        close_at: quiz.close_at,
      },
      ipAddress,
      userAgent,
    });

    return quiz;
  }

  /**
   * Daftar kuis pada sebuah kelas. Mahasiswa hanya melihat yang diterbitkan.
   */
  static async listClassQuizzes({ classId, user }) {
    const classRow = await prisma.class.findUnique({
      where: { id: classId },
      include: { lecturer: true },
    });
    if (!classRow) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }

    await ensureCanReadClass({ user, classRecord: classRow, classId });

    const isStudent = user.role === ROLES.MAHASISWA;
    const quizzes = await prisma.quiz.findMany({
      where: {
        meeting: { class_id: classId },
        ...(isStudent ? { is_published: true } : {}),
      },
      orderBy: { open_at: 'asc' },
      include: {
        meeting: { select: { meeting_number: true } },
        _count: { select: { questions: true, attempts: true } },
      },
    });

    return quizzes.map((quiz) => ({
      id: quiz.id,
      meeting_id: quiz.meeting_id,
      meeting_number: quiz.meeting.meeting_number,
      title: quiz.title,
      duration_minutes: quiz.duration_minutes,
      open_at: quiz.open_at.toISOString(),
      close_at: quiz.close_at.toISOString(),
      is_published: quiz.is_published,
      question_count: quiz._count.questions,
      attempt_count: isStudent ? undefined : quiz._count.attempts,
    }));
  }

  /**
   * Detail kuis. Mahasiswa hanya melihat kuis terbit dan TANPA kunci jawaban.
   */
  static async getQuizDetail({ quizId, user }) {
    const quiz = await this.#getQuizOrThrow(quizId, quizDetailInclude);
    const isStudent = user.role === ROLES.MAHASISWA;

    if (isStudent && !quiz.is_published) {
      // Draft tersembunyi dari mahasiswa — diperlakukan sebagai tidak ada.
      throw new AppError('Kuis tidak ditemukan', 404);
    }

    await this.#ensureCanReadQuiz(quiz, user);

    return this.serializeQuiz(quiz, { forStudent: isStudent });
  }

  /**
   * Serialisasi kuis; kunci jawaban disaring untuk mahasiswa.
   */
  static serializeQuiz(quiz, { forStudent = false } = {}) {
    return {
      id: quiz.id,
      meeting_id: quiz.meeting.id,
      meeting_number: quiz.meeting.meeting_number,
      class_id: quiz.meeting.class.id,
      class_name: quiz.meeting.class.name,
      course_code: quiz.meeting.class.course.code,
      course_name: quiz.meeting.class.course.name,
      title: quiz.title,
      instructions: quiz.instructions,
      duration_minutes: quiz.duration_minutes,
      open_at: quiz.open_at.toISOString(),
      close_at: quiz.close_at.toISOString(),
      is_published: quiz.is_published,
      total_points: roundQuizScore(
        quiz.questions.reduce((sum, question) => sum + Number(question.points), 0)
      ),
      question_count: quiz.questions.length,
      attempt_count: forStudent ? undefined : quiz._count?.attempts,
      questions: quiz.questions.map((question) =>
        forStudent ? sanitizeQuestionForStudent(question) : this.serializeQuestion(question)
      ),
    };
  }

  /**
   * Serialisasi soal lengkap (khusus dosen/Admin — memuat kunci jawaban).
   */
  static serializeQuestion(question) {
    return {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      points: Number(question.points),
      answer_key: question.answer_key,
      order_index: question.order_index,
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        order_index: option.order_index,
      })),
    };
  }

  /**
   * Perbarui kuis (judul, instruksi, durasi, jendela waktu).
   */
  static async updateQuiz({ quizId, payload, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId);
    this.#ensureCanManageQuiz(quiz, user);

    const openAt = payload.open_at ? new Date(payload.open_at) : quiz.open_at;
    const closeAt = payload.close_at ? new Date(payload.close_at) : quiz.close_at;
    if (openAt >= closeAt) {
      throw new AppError('Waktu buka kuis harus lebih awal daripada waktu tutup kuis', 400);
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.instructions !== undefined ? { instructions: payload.instructions } : {}),
        ...(payload.duration_minutes !== undefined ? { duration_minutes: payload.duration_minutes } : {}),
        ...(payload.open_at !== undefined ? { open_at: openAt } : {}),
        ...(payload.close_at !== undefined ? { close_at: closeAt } : {}),
      },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'UPDATE_QUIZ',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      oldValues: {
        title: quiz.title,
        duration_minutes: quiz.duration_minutes,
        open_at: quiz.open_at,
        close_at: quiz.close_at,
      },
      newValues: {
        title: updated.title,
        duration_minutes: updated.duration_minutes,
        open_at: updated.open_at,
        close_at: updated.close_at,
      },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  /**
   * Hapus kuis beserta seluruh butir soal dan percobaan (cascade).
   */
  static async deleteQuiz({ quizId, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId);
    this.#ensureCanManageQuiz(quiz, user);

    await prisma.quiz.delete({ where: { id: quizId } });

    await AuditLogService.record({
      userId: user.id,
      action: 'DELETE_QUIZ',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      oldValues: { title: quiz.title, meeting_id: quiz.meeting_id },
      ipAddress,
      userAgent,
    });

    return { id: quizId, deleted: true };
  }

  /**
   * Terbitkan / tarik publikasi kuis (FR-025). Penerbitan memvalidasi
   * kelengkapan butir soal dan kunci jawaban.
   */
  static async publishQuiz({ quizId, payload, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId, {
      ...quizOwnershipInclude,
      questions: { include: { options: true } },
    });
    this.#ensureCanManageQuiz(quiz, user);

    if (payload.is_published && !quiz.is_published) {
      this.#assertPublishable(quiz);
    }

    const updated = await prisma.quiz.update({
      where: { id: quizId },
      data: { is_published: payload.is_published },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'PUBLISH_QUIZ',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      oldValues: { is_published: quiz.is_published },
      newValues: { is_published: updated.is_published },
      ipAddress,
      userAgent,
    });

    // Notifikasi best-effort: kuis diterbitkan (FR-057).
    if (!quiz.is_published && updated.is_published) {
      const recipientIds = await NotificationService.getEnrolledStudentUserIds(
        quiz.meeting.class_id
      );
      const template = buildQuizPublishedNotification({
        quizTitle: updated.title,
        closeAt: updated.close_at,
        className: quiz.meeting.class.name,
      });
      await NotificationService.notifyMany({
        userIds: recipientIds,
        type: template.type,
        title: template.title,
        message: template.message,
        link: template.link,
        dedupeKeyFor: () => `quiz:${updated.id}:published`,
      });
    }

    return updated;
  }

  /**
   * Pastikan kuis masih boleh dimutasi (belum ada percobaan mahasiswa).
   */
  static async #assertNoAttempts(quizId) {
    const attemptCount = await prisma.quizAttempt.count({ where: { quiz_id: quizId } });
    if (attemptCount > 0) {
      throw new AppError(
        'Butir soal tidak dapat diubah karena sudah ada mahasiswa yang mengerjakan kuis ini',
        409
      );
    }
  }

  /**
   * Tambah butir soal (FR-040). `order_index` kosong otomatis `max + 1`.
   */
  static async addQuestion({ quizId, payload, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId);
    this.#ensureCanManageQuiz(quiz, user);
    await this.#assertNoAttempts(quizId);

    const lastQuestion = await prisma.quizQuestion.findFirst({
      where: { quiz_id: quizId },
      orderBy: { order_index: 'desc' },
      select: { order_index: true },
    });
    const orderIndex = payload.order_index ?? (lastQuestion?.order_index ?? 0) + 1;

    const question = await prisma.quizQuestion.create({
      data: {
        quiz_id: quizId,
        question_text: payload.question_text,
        type: payload.type,
        points: payload.points ?? 1,
        answer_key: payload.type === QUIZ_QUESTION_TYPES.ESSAY ? payload.answer_key ?? null : null,
        order_index: orderIndex,
        ...(payload.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE
          ? {
              options: {
                create: payload.options.map((option, index) => ({
                  option_text: option.option_text,
                  is_correct: option.is_correct,
                  order_index: option.order_index ?? index + 1,
                })),
              },
            }
          : {}),
      },
      include: { options: { orderBy: { order_index: 'asc' } } },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'CREATE_QUIZ_QUESTION',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      newValues: {
        question_id: question.id,
        type: question.type,
        points: Number(question.points),
        order_index: question.order_index,
      },
      ipAddress,
      userAgent,
    });

    return this.serializeQuestion(question);
  }

  /**
   * Ambil soal milik kuis, atau lempar 404.
   */
  static async #getQuestionOrThrow(quizId, questionId) {
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: { options: { orderBy: { order_index: 'asc' } } },
    });
    if (!question || question.quiz_id !== quizId) {
      throw new AppError('Butir soal tidak ditemukan', 404);
    }
    return question;
  }

  /**
   * Perbarui butir soal. Bila `options` dikirim, seluruh opsi diganti ulang.
   */
  static async updateQuestion({ quizId, questionId, payload, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId);
    this.#ensureCanManageQuiz(quiz, user);
    const question = await this.#getQuestionOrThrow(quizId, questionId);
    await this.#assertNoAttempts(quizId);

    const updated = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        ...(payload.question_text !== undefined ? { question_text: payload.question_text } : {}),
        ...(payload.points !== undefined ? { points: payload.points } : {}),
        ...(payload.answer_key !== undefined ? { answer_key: payload.answer_key } : {}),
        ...(payload.order_index !== undefined ? { order_index: payload.order_index } : {}),
        ...(payload.options !== undefined
          ? {
              options: {
                deleteMany: {},
                create: payload.options.map((option, index) => ({
                  option_text: option.option_text,
                  is_correct: option.is_correct,
                  order_index: option.order_index ?? index + 1,
                })),
              },
            }
          : {}),
      },
      include: { options: { orderBy: { order_index: 'asc' } } },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'UPDATE_QUIZ_QUESTION',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      oldValues: { question_id: questionId },
      newValues: { question_id: questionId, updated_fields: Object.keys(payload) },
      ipAddress,
      userAgent,
    });

    return this.serializeQuestion(updated);
  }

  /**
   * Hapus butir soal beserta opsi dan jawaban terkait (cascade).
   */
  static async deleteQuestion({ quizId, questionId, user, ipAddress, userAgent }) {
    const quiz = await this.#getQuizOrThrow(quizId);
    this.#ensureCanManageQuiz(quiz, user);
    await this.#getQuestionOrThrow(quizId, questionId);
    await this.#assertNoAttempts(quizId);

    await prisma.quizQuestion.delete({ where: { id: questionId } });

    await AuditLogService.record({
      userId: user.id,
      action: 'DELETE_QUIZ_QUESTION',
      entity: AUDIT_ENTITIES.QUIZZES,
      entityId: quizId,
      oldValues: { question_id: questionId },
      ipAddress,
      userAgent,
    });

    return { id: questionId, deleted: true };
  }

  /**
   * Roster hasil kuis untuk seluruh mahasiswa (FR-041).
   */
  static async getQuizRoster({ quizId, user }) {
    const quiz = await this.#getQuizOrThrow(quizId, {
      ...quizOwnershipInclude,
      questions: { select: { id: true, points: true } },
    });
    this.#ensureCanManageQuiz(quiz, user);

    const attempts = await prisma.quizAttempt.findMany({
      where: { quiz_id: quizId },
      orderBy: { started_at: 'asc' },
      include: {
        student: {
          include: {
            user: {
              select: {
                username: true,
                profile: { select: { full_name: true } },
              },
            },
          },
        },
      },
    });

    const totalPoints = quiz.questions.reduce((sum, question) => sum + Number(question.points), 0);

    return {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        total_points: roundQuizScore(totalPoints),
        question_count: quiz.questions.length,
        is_published: quiz.is_published,
      },
      total_students: attempts.length,
      roster: attempts.map((attempt) => ({
        attempt_id: attempt.id,
        student_id: attempt.student_id,
        nim: attempt.student.nim,
        full_name: attempt.student.user.profile?.full_name ?? attempt.student.user.username,
        status: attempt.status,
        score: attempt.score != null ? Number(attempt.score) : null,
        started_at: attempt.started_at.toISOString(),
        submitted_at: attempt.submitted_at ? attempt.submitted_at.toISOString() : null,
        graded_at: attempt.graded_at ? attempt.graded_at.toISOString() : null,
      })),
    };
  }

  /**
   * Ekspor roster hasil kuis sebagai CSV (FR-041).
   */
  static async exportQuizRosterCsv({ quizId, user }) {
    const roster = await this.getQuizRoster({ quizId, user });

    const escapeCsv = (value) => {
      const text = value === null || value === undefined ? '' : String(value);
      if (/[",\n;]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const header = ['nim', 'nama', 'status', 'skor', 'mulai', 'dikumpulkan', 'dinilai'];
    const rows = roster.roster.map((entry) =>
      [
        entry.nim,
        entry.full_name,
        entry.status,
        entry.score ?? '',
        entry.started_at,
        entry.submitted_at ?? '',
        entry.graded_at ?? '',
      ]
        .map(escapeCsv)
        .join(',')
    );

    return {
      filename: `hasil-kuis-${roster.quiz.id}.csv`,
      csv: [header.join(','), ...rows].join('\n'),
    };
  }

  /**
   * Penilaian manual jawaban esai oleh Dosen/Admin (FR-041).
   *
   * Skor akhir dihitung ulang penuh dari `points_awarded` seluruh jawaban
   * dibagi total poin kuis (0–100, 2 desimal). Status menjadi GRADED bila
   * seluruh jawaban esai telah dinilai.
   */
  static async gradeAttempt({ attemptId, payload, user, ipAddress, userAgent }) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            ...quizOwnershipInclude,
            questions: true,
          },
        },
        answers: true,
      },
    });
    if (!attempt) {
      throw new AppError('Percobaan kuis tidak ditemukan', 404);
    }

    this.#ensureCanManageQuiz(attempt.quiz, user);

    if (attempt.status === QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError('Percobaan kuis masih berlangsung dan belum dapat dinilai', 400);
    }

    // Peta jawaban berdasarkan ID untuk validasi cepat.
    const answersById = new Map(attempt.answers.map((answer) => [answer.id, answer]));
    const questionsById = new Map(attempt.quiz.questions.map((question) => [question.id, question]));

    const gradeUpdates = [];
    for (const entry of payload.answers) {
      const answer = answersById.get(entry.answer_id);
      if (!answer) {
        throw new AppError(`Jawaban ${entry.answer_id} tidak ditemukan pada percobaan ini`, 400);
      }
      const question = questionsById.get(answer.question_id);
      if (question.type !== QUIZ_QUESTION_TYPES.ESSAY) {
        throw new AppError(
          'Hanya jawaban soal esai yang dapat dinilai manual; pilihan ganda dinilai otomatis',
          400
        );
      }
      if (entry.points_awarded < 0 || entry.points_awarded > Number(question.points)) {
        throw new AppError(
          `Poin untuk soal #${question.order_index} harus pada rentang 0–${Number(question.points)}`,
          400
        );
      }
      gradeUpdates.push({
        answerId: entry.answer_id,
        points_awarded: entry.points_awarded,
        feedback: entry.feedback ?? null,
      });
    }

    // Terapkan nilai esai lalu hitung ulang skor akhir.
    for (const update of gradeUpdates) {
      await prisma.quizAnswer.update({
        where: { id: update.answerId },
        data: {
          points_awarded: update.points_awarded,
          feedback: update.feedback,
        },
      });
    }

    const refreshedAnswers = await prisma.quizAnswer.findMany({
      where: { attempt_id: attemptId },
      include: { question: { select: { points: true, type: true } } },
    });

    const totalPoints = refreshedAnswers.reduce((sum, answer) => sum + Number(answer.question.points), 0);
    const awardedPoints = refreshedAnswers.reduce(
      (sum, answer) => sum + (answer.points_awarded != null ? Number(answer.points_awarded) : 0),
      0
    );
    const allGraded = refreshedAnswers.every((answer) => answer.points_awarded != null);
    const score = totalPoints > 0 ? roundQuizScore((awardedPoints / totalPoints) * 100) : 0;

    const updated = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        ...(allGraded
          ? { status: QUIZ_ATTEMPT_STATUS.GRADED, graded_at: new Date(), graded_by: user.id }
          : {}),
      },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'GRADE_QUIZ_ATTEMPT',
      entity: AUDIT_ENTITIES.QUIZ_ATTEMPTS,
      entityId: attemptId,
      oldValues: { score: attempt.score != null ? Number(attempt.score) : null },
      newValues: { score, graded_count: gradeUpdates.length },
      ipAddress,
      userAgent,
    });

    return {
      attempt_id: updated.id,
      status: updated.status,
      score: updated.score != null ? Number(updated.score) : null,
      fully_graded: allGraded,
    };
  }
}
