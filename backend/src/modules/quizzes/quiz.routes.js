import { Router } from 'express';
import { QuizController } from './quiz.controller.js';
import { QuizAttemptController } from './quizAttempt.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  meetingIdParamSchema,
  classIdParamSchema,
  quizIdParamSchema,
  quizQuestionParamSchema,
  quizAttemptParamSchema,
  createQuizSchema,
  updateQuizSchema,
  publishQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  gradeAttemptSchema,
  saveAnswersSchema,
} from './quiz.dto.js';

/**
 * Rute kuis berinduk pertemuan (dipasang di /api/meetings).
 */
export const meetingQuizRoutes = Router();

meetingQuizRoutes.use(authenticateToken);

meetingQuizRoutes.post(
  '/:meetingId/quizzes',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(meetingIdParamSchema),
  validate(createQuizSchema),
  QuizController.createQuiz
);

/**
 * Rute kuis berinduk kelas (dipasang di /api/classes).
 */
export const classQuizRoutes = Router();

classQuizRoutes.use(authenticateToken);

classQuizRoutes.get(
  '/:classId/quizzes',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(classIdParamSchema),
  QuizController.listClassQuizzes
);

/**
 * Rute resource kuis (dipasang di /api/quizzes).
 */
export const quizRoutes = Router();

quizRoutes.use(authenticateToken);

// Mahasiswa memulai percobaan kuis.
quizRoutes.post(
  '/:id/attempts',
  requireRole(ROLES.MAHASISWA),
  validate(quizIdParamSchema),
  QuizAttemptController.startAttempt
);

// Manajemen kuis oleh Dosen pengampu/Admin.
quizRoutes.patch(
  '/:id/publish',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  validate(publishQuizSchema),
  QuizController.publishQuiz
);

quizRoutes.get(
  '/:id/attempts',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  QuizController.getQuizRoster
);

quizRoutes.get(
  '/:id/attempts/export',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  QuizController.exportQuizRoster
);

quizRoutes.post(
  '/:id/questions',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  validate(createQuestionSchema),
  QuizController.addQuestion
);

quizRoutes.put(
  '/:id/questions/:questionId',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizQuestionParamSchema),
  validate(updateQuestionSchema),
  QuizController.updateQuestion
);

quizRoutes.delete(
  '/:id/questions/:questionId',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizQuestionParamSchema),
  QuizController.deleteQuestion
);

quizRoutes.get(
  '/:id',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  QuizController.getQuizDetail
);

quizRoutes.put(
  '/:id',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  validate(updateQuizSchema),
  QuizController.updateQuiz
);

quizRoutes.delete(
  '/:id',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizIdParamSchema),
  QuizController.deleteQuiz
);

/**
 * Rute resource percobaan kuis (dipasang di /api/quiz-attempts).
 */
export const quizAttemptRoutes = Router();

quizAttemptRoutes.use(authenticateToken);

quizAttemptRoutes.get(
  '/:attemptId',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(quizAttemptParamSchema),
  QuizAttemptController.getAttempt
);

quizAttemptRoutes.put(
  '/:attemptId/answers',
  requireRole(ROLES.MAHASISWA),
  validate(quizAttemptParamSchema),
  validate(saveAnswersSchema),
  QuizAttemptController.saveAnswers
);

quizAttemptRoutes.post(
  '/:attemptId/submit',
  requireRole(ROLES.MAHASISWA),
  validate(quizAttemptParamSchema),
  QuizAttemptController.submitAttempt
);

quizAttemptRoutes.put(
  '/:attemptId/grade',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(quizAttemptParamSchema),
  validate(gradeAttemptSchema),
  QuizController.gradeAttempt
);
