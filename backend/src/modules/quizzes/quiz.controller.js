import { QuizService } from './quiz.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class QuizController {
  /** POST /api/meetings/:meetingId/quizzes */
  static async createQuiz(req, res, next) {
    try {
      const { ipAddress, userAgent } = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
      const quiz = await QuizService.createQuiz({
        meetingId: req.params.meetingId,
        payload: req.body,
        user: req.user,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Kuis berhasil dibuat. Terbitkan setelah butir soal lengkap.',
        data: quiz,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/classes/:classId/quizzes */
  static async listClassQuizzes(req, res, next) {
    try {
      const quizzes = await QuizService.listClassQuizzes({
        classId: req.params.classId,
        user: req.user,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar kuis berhasil diambil',
        data: quizzes,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/quizzes/:id */
  static async getQuizDetail(req, res, next) {
    try {
      const quiz = await QuizService.getQuizDetail({ quizId: req.params.id, user: req.user });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail kuis berhasil diambil',
        data: quiz,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PUT /api/quizzes/:id */
  static async updateQuiz(req, res, next) {
    try {
      const quiz = await QuizService.updateQuiz({
        quizId: req.params.id,
        payload: req.body,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Kuis berhasil diperbarui',
        data: quiz,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** DELETE /api/quizzes/:id */
  static async deleteQuiz(req, res, next) {
    try {
      const result = await QuizService.deleteQuiz({
        quizId: req.params.id,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Kuis beserta seluruh percobaan berhasil dihapus',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PATCH /api/quizzes/:id/publish */
  static async publishQuiz(req, res, next) {
    try {
      const quiz = await QuizService.publishQuiz({
        quizId: req.params.id,
        payload: req.body,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: quiz.is_published ? 'Kuis berhasil diterbitkan' : 'Publikasi kuis ditarik',
        data: quiz,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** POST /api/quizzes/:id/questions */
  static async addQuestion(req, res, next) {
    try {
      const question = await QuizService.addQuestion({
        quizId: req.params.id,
        payload: req.body,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Butir soal berhasil ditambahkan',
        data: question,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PUT /api/quizzes/:id/questions/:questionId */
  static async updateQuestion(req, res, next) {
    try {
      const question = await QuizService.updateQuestion({
        quizId: req.params.id,
        questionId: req.params.questionId,
        payload: req.body,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Butir soal berhasil diperbarui',
        data: question,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** DELETE /api/quizzes/:id/questions/:questionId */
  static async deleteQuestion(req, res, next) {
    try {
      const result = await QuizService.deleteQuestion({
        quizId: req.params.id,
        questionId: req.params.questionId,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Butir soal berhasil dihapus',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/quizzes/:id/attempts — roster hasil */
  static async getQuizRoster(req, res, next) {
    try {
      const roster = await QuizService.getQuizRoster({ quizId: req.params.id, user: req.user });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Roster hasil kuis berhasil diambil',
        data: roster,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/quizzes/:id/attempts/export — CSV */
  static async exportQuizRoster(req, res, next) {
    try {
      const { filename, csv } = await QuizService.exportQuizRosterCsv({
        quizId: req.params.id,
        user: req.user,
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }

  /** PUT /api/quiz-attempts/:attemptId/grade */
  static async gradeAttempt(req, res, next) {
    try {
      const result = await QuizService.gradeAttempt({
        attemptId: req.params.attemptId,
        payload: req.body,
        user: req.user,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: result.fully_graded
          ? 'Penilaian kuis selesai. Skor akhir telah dihitung.'
          : 'Penilaian parsial tersimpan. Masih ada esai yang belum dinilai.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
