import { QuizAttemptService } from './quizAttempt.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class QuizAttemptController {
  /** POST /api/quizzes/:id/attempts — mulai / lanjutkan percobaan. */
  static async startAttempt(req, res, next) {
    try {
      const { attempt, created } = await QuizAttemptService.startAttempt({
        quizId: req.params.id,
        user: req.user,
      });

      const data = QuizAttemptService.serializeAttemptForStudent(attempt);

      return apiResponse.success(res, {
        statusCode: created ? 201 : 200,
        message: created
          ? 'Percobaan kuis dimulai. Perhatikan batas waktu pengerjaan.'
          : 'Melanjutkan percobaan kuis yang sedang berlangsung.',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/quiz-attempts/:attemptId */
  static async getAttempt(req, res, next) {
    try {
      const data = await QuizAttemptService.getAttempt({
        attemptId: req.params.attemptId,
        user: req.user,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail percobaan kuis berhasil diambil',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PUT /api/quiz-attempts/:attemptId/answers */
  static async saveAnswers(req, res, next) {
    try {
      const data = await QuizAttemptService.saveAnswers({
        attemptId: req.params.attemptId,
        payload: req.body,
        user: req.user,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Jawaban berhasil disimpan',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** POST /api/quiz-attempts/:attemptId/submit */
  static async submitAttempt(req, res, next) {
    try {
      const data = await QuizAttemptService.submitAttempt({
        attemptId: req.params.attemptId,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Kuis berhasil dikumpulkan',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
