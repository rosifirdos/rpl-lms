import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { ROLES } from '../../constants/roles.js';
import { ensureCanManageClass, ensureEnrolledInClass } from '../../utils/ownership.js';
import {
  QUIZ_QUESTION_TYPES,
  QUIZ_ATTEMPT_STATUS,
  roundQuizScore,
} from '../../constants/quiz.js';

const quizAttemptInclude = {
  quiz: {
    include: {
      meeting: {
        include: {
          class: {
            include: { lecturer: true },
          },
        },
      },
      questions: {
        orderBy: { order_index: 'asc' },
        include: { options: { orderBy: { order_index: 'asc' } } },
      },
    },
  },
  student: {
    include: { user: { select: { id: true, username: true } } },
  },
  answers: true,
};

/**
 * Sanitizer soal untuk mahasiswa. `revealAnswers` hanya boleh `true` SETELAH
 * submission — sebelum itu kunci jawaban tidak pernah dikirim (FR-041).
 */
function sanitizeQuestion(question, { revealAnswers = false } = {}) {
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
      ...(revealAnswers && question.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE
        ? { is_correct: option.is_correct }
        : {}),
    })),
  };
}

/**
 * Layanan pengerjaan kuis oleh mahasiswa (FR-040, FR-041).
 *
 * Timer sepenuhnya ditegakkan server: `started_at`, `deadline_at`, dan
 * `submitted_at` dihitung backend. Auto-submit bersifat lazy — dijalankan
 * saat percobaan diakses setelah deadline, dengan `submitted_at` diisi
 * `deadline_at` (bukan waktu akses).
 */
export class QuizAttemptService {
  /**
   * Ambil percobaan beserta relasi lengkap, atau lempar 404.
   */
  static async #getAttemptOrThrow(attemptId) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: quizAttemptInclude,
    });
    if (!attempt) {
      throw new AppError('Percobaan kuis tidak ditemukan', 404);
    }
    return attempt;
  }

  /**
   * Pastikan pengguna adalah pemilik percobaan (mahasiswa pemilik).
   */
  static #ensureOwner(attempt, user) {
    if (attempt.student.user.id !== user.id) {
      throw new AppError('Akses ditolak: percobaan kuis ini bukan milik Anda', 403);
    }
  }

  /**
   * Hitung hasil penilaian otomatis pilihan ganda untuk sebuah percobaan.
   *
   * @returns {{awarded: number, total: number}} dalam poin mentah
   */
  static #computeMultipleChoicePoints(attempt) {
    let awarded = 0;
    let total = 0;

    for (const question of attempt.quiz.questions) {
      total += Number(question.points);
      if (question.type !== QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE) continue;

      const answer = attempt.answers.find((entry) => entry.question_id === question.id);
      if (!answer?.selected_option_id) continue;

      const selected = question.options.find((option) => option.id === answer.selected_option_id);
      if (selected?.is_correct) {
        awarded += Number(question.points);
      }
    }

    return { awarded, total };
  }

  /**
   * Kumpulkan (submit) sebuah percobaan: nilai otomatis pilihan ganda,
   * tetapkan status akhir, dan kunci percobaan dari pengerjaan lebih lanjut.
   *
   * @param {object} attempt percobaan beserta relasi `quizAttemptInclude`
   * @param {Date} submittedAt waktu pengumpulan efektif
   * @returns {Promise<object>} percobaan terbaru
   */
  static async #finalizeSubmission(attempt, submittedAt) {
    const { awarded, total } = this.#computeMultipleChoicePoints(attempt);
    const hasEssay = attempt.quiz.questions.some(
      (question) => question.type === QUIZ_QUESTION_TYPES.ESSAY
    );

    // Nilai setiap jawaban pilihan ganda: poin penuh bila benar, nol bila salah.
    for (const question of attempt.quiz.questions) {
      if (question.type !== QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE) continue;
      const answer = attempt.answers.find((entry) => entry.question_id === question.id);
      if (!answer) continue;

      const selected = question.options.find((option) => option.id === answer.selected_option_id);
      const points = selected?.is_correct ? Number(question.points) : 0;

      await prisma.quizAnswer.update({
        where: { id: answer.id },
        data: { points_awarded: points },
      });
    }

    const score = total > 0 ? roundQuizScore((awarded / total) * 100) : 0;
    const status = hasEssay ? QUIZ_ATTEMPT_STATUS.SUBMITTED : QUIZ_ATTEMPT_STATUS.GRADED;

    return prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        submitted_at: submittedAt,
        status,
        score,
        ...(status === QUIZ_ATTEMPT_STATUS.GRADED ? { graded_at: submittedAt } : {}),
      },
      include: quizAttemptInclude,
    });
  }

  /**
   * Auto-submit lazy: bila percobaan masih berjalan namun deadline terlewat,
   * kumpulkan otomatis dengan `submitted_at = deadline_at`.
   *
   * @returns {Promise<object>} percobaan (mungkin telah disubmit otomatis)
   */
  static async #autoSubmitIfExpired(attempt) {
    const now = new Date();
    if (attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) return attempt;
    if (now <= attempt.deadline_at) return attempt;

    return this.#finalizeSubmission(attempt, attempt.deadline_at);
  }

  /**
   * Mulai (atau lanjutkan) percobaan kuis (FR-040).
   *
   * @returns {Promise<{attempt: object, created: boolean}>}
   */
  static async startAttempt({ quizId, user }) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        meeting: { include: { class: { include: { lecturer: true } } } },
        questions: { orderBy: { order_index: 'asc' }, include: { options: true } },
      },
    });
    if (!quiz || !quiz.is_published) {
      // Kuis draft tersembunyi dari mahasiswa.
      throw new AppError('Kuis tidak ditemukan', 404);
    }

    await ensureEnrolledInClass({ userId: user.id, classId: quiz.meeting.class_id });

    const now = new Date();
    if (now < quiz.open_at) {
      throw new AppError('Kuis belum dibuka. Silakan kembali pada jadwal yang ditentukan.', 400);
    }
    if (now > quiz.close_at) {
      throw new AppError('Kuis telah ditutup. Pengerjaan tidak dapat dimulai lagi.', 400);
    }

    const student = await prisma.mahasiswa.findUnique({ where: { user_id: user.id } });
    if (!student) {
      throw new AppError('Data mahasiswa tidak ditemukan', 404);
    }
    const currentAttempt = await prisma.quizAttempt.findUnique({
      where: { quiz_id_student_id: { quiz_id: quizId, student_id: student.id } },
      include: quizAttemptInclude,
    });

    if (currentAttempt) {
      if (currentAttempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
        throw new AppError('Kuis telah diselesaikan dan tidak dapat dikerjakan ulang', 409);
      }
      const refreshed = await this.#autoSubmitIfExpired(currentAttempt);
      if (refreshed.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
        throw new AppError('Kuis telah diselesaikan dan tidak dapat dikerjakan ulang', 409);
      }
      return { attempt: refreshed, created: false };
    }

    const deadline = new Date(
      Math.min(now.getTime() + quiz.duration_minutes * 60 * 1000, quiz.close_at.getTime())
    );

    const attempt = await prisma.quizAttempt.create({
      data: {
        quiz_id: quizId,
        student_id: student.id,
        deadline_at: deadline,
      },
      include: quizAttemptInclude,
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'START_QUIZ_ATTEMPT',
      entity: AUDIT_ENTITIES.QUIZ_ATTEMPTS,
      entityId: attempt.id,
      newValues: { quiz_id: quizId, deadline_at: deadline.toISOString() },
    });

    return { attempt, created: true };
  }

  /**
   * Detail percobaan. Mahasiswa pemilik mendapat versi tersanitasi; dosen
   * pengampu/Admin mendapat akses penuh untuk monitoring.
   */
  static async getAttempt({ attemptId, user }) {
    let attempt = await this.#getAttemptOrThrow(attemptId);

    if (user.role === ROLES.MAHASISWA) {
      this.#ensureOwner(attempt, user);
      attempt = await this.#autoSubmitIfExpired(attempt);
      return this.serializeAttemptForStudent(attempt);
    }

    // Dosen pengampu / Admin — akses monitoring penuh.
    ensureCanManageClass(attempt.quiz.meeting.class, user);
    return this.serializeAttemptForGrader(attempt);
  }

  /**
   * Simpan jawaban mahasiswa (bisa parsial, FR-040).
   */
  static async saveAnswers({ attemptId, payload, user }) {
    let attempt = await this.#getAttemptOrThrow(attemptId);
    this.#ensureOwner(attempt, user);

    if (attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError('Kuis telah diselesaikan dan tidak dapat diubah lagi', 409);
    }

    attempt = await this.#autoSubmitIfExpired(attempt);
    if (attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError(
        'Waktu pengerjaan telah berakhir. Jawaban dikumpulkan otomatis oleh sistem.',
        400
      );
    }

    const questionsById = new Map(attempt.quiz.questions.map((question) => [question.id, question]));

    for (const entry of payload.answers) {
      const question = questionsById.get(entry.question_id);
      if (!question) {
        throw new AppError(`Soal ${entry.question_id} bukan bagian dari kuis ini`, 400);
      }

      let data;
      if (question.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE) {
        if (!entry.selected_option_id) {
          throw new AppError(`Soal #${question.order_index} wajib memilih salah satu opsi`, 400);
        }
        const option = question.options.find((item) => item.id === entry.selected_option_id);
        if (!option) {
          throw new AppError(`Opsi tidak valid untuk soal #${question.order_index}`, 400);
        }
        data = { selected_option_id: entry.selected_option_id, answer_text: null };
      } else {
        data = {
          selected_option_id: null,
          answer_text: entry.answer_text ?? '',
        };
      }

      await prisma.quizAnswer.upsert({
        where: { attempt_id_question_id: { attempt_id: attemptId, question_id: question.id } },
        update: data,
        create: { attempt_id: attemptId, question_id: question.id, ...data },
      });
    }

    const refreshed = await this.#getAttemptOrThrow(attemptId);
    return this.serializeAttemptForStudent(refreshed);
  }

  /**
   * Kumpulkan percobaan kuis (FR-040). Penilaian pilihan ganda otomatis.
   */
  static async submitAttempt({ attemptId, user, ipAddress, userAgent }) {
    let attempt = await this.#getAttemptOrThrow(attemptId);
    this.#ensureOwner(attempt, user);

    if (attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError('Kuis telah diselesaikan dan tidak dapat dikumpulkan ulang', 409);
    }

    const now = new Date();
    // Auto-submit setelah deadline memakai deadline_at sebagai stempel waktu.
    const submittedAt = now <= attempt.deadline_at ? now : attempt.deadline_at;
    const wasAutoSubmitted = now > attempt.deadline_at;

    attempt = await this.#finalizeSubmission(attempt, submittedAt);

    await AuditLogService.record({
      userId: user.id,
      action: wasAutoSubmitted ? 'AUTO_SUBMIT_QUIZ_ATTEMPT' : 'SUBMIT_QUIZ_ATTEMPT',
      entity: AUDIT_ENTITIES.QUIZ_ATTEMPTS,
      entityId: attemptId,
      newValues: {
        quiz_id: attempt.quiz_id,
        submitted_at: submittedAt.toISOString(),
        score: attempt.score != null ? Number(attempt.score) : null,
        status: attempt.status,
      },
      ipAddress,
      userAgent,
    });

    return this.serializeAttemptForStudent(attempt);
  }

  /**
   * Serialisasi percobaan untuk mahasiswa pemilik.
   */
  static serializeAttemptForStudent(attempt) {
    const now = new Date();
    const isSubmitted = attempt.status !== QUIZ_ATTEMPT_STATUS.IN_PROGRESS;
    const revealAnswers = isSubmitted;

    const answersByQuestionId = new Map(
      (attempt.answers ?? []).map((answer) => [answer.question_id, answer])
    );

    return {
      attempt: {
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        status: attempt.status,
        started_at: attempt.started_at.toISOString(),
        deadline_at: attempt.deadline_at.toISOString(),
        submitted_at: attempt.submitted_at ? attempt.submitted_at.toISOString() : null,
        score: attempt.score != null ? Number(attempt.score) : null,
        remaining_seconds:
          !isSubmitted && attempt.deadline_at > now
            ? Math.max(0, Math.floor((attempt.deadline_at - now) / 1000))
            : 0,
        server_time: now.toISOString(),
      },
      questions: attempt.quiz.questions.map((question) => sanitizeQuestion(question, { revealAnswers })),
      answers: attempt.quiz.questions.map((question) => {
        const answer = answersByQuestionId.get(question.id);
        return {
          question_id: question.id,
          selected_option_id: answer?.selected_option_id ?? null,
          answer_text: answer?.answer_text ?? null,
          ...(isSubmitted && question.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE
            ? {
                is_correct: answer?.selected_option_id
                  ? Boolean(
                      question.options.find((option) => option.id === answer.selected_option_id)?.is_correct
                    )
                  : false,
                points_awarded: answer?.points_awarded != null ? Number(answer.points_awarded) : null,
              }
            : {}),
          ...(isSubmitted && question.type === QUIZ_QUESTION_TYPES.ESSAY
            ? {
                points_awarded: answer?.points_awarded != null ? Number(answer.points_awarded) : null,
                feedback: answer?.feedback ?? null,
              }
            : {}),
        };
      }),
    };
  }

  /**
   * Serialisasi percobaan untuk dosen pengampu/Admin (memuat kunci jawaban).
   */
  static serializeAttemptForGrader(attempt) {
    const answersByQuestionId = new Map(
      (attempt.answers ?? []).map((answer) => [answer.question_id, answer])
    );

    return {
      attempt: {
        id: attempt.id,
        quiz_id: attempt.quiz_id,
        student: {
          id: attempt.student.id,
          nim: attempt.student.nim,
          full_name: attempt.student.user.profile?.full_name ?? attempt.student.user.username,
        },
        status: attempt.status,
        started_at: attempt.started_at.toISOString(),
        deadline_at: attempt.deadline_at.toISOString(),
        submitted_at: attempt.submitted_at ? attempt.submitted_at.toISOString() : null,
        score: attempt.score != null ? Number(attempt.score) : null,
      },
      questions: attempt.quiz.questions.map((question) => ({
        id: question.id,
        question_text: question.question_text,
        type: question.type,
        points: Number(question.points),
        answer_key: question.answer_key,
        order_index: question.order_index,
        options: question.options.map((option) => ({
          id: option.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          order_index: option.order_index,
        })),
      })),
      answers: attempt.quiz.questions.map((question) => {
        const answer = answersByQuestionId.get(question.id);
        return {
          id: answer?.id ?? null,
          question_id: question.id,
          selected_option_id: answer?.selected_option_id ?? null,
          answer_text: answer?.answer_text ?? null,
          points_awarded: answer?.points_awarded != null ? Number(answer.points_awarded) : null,
          feedback: answer?.feedback ?? null,
        };
      }),
    };
  }
}
