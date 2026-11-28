import { createReadStream } from 'node:fs';
import { SubmissionService } from './submission.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class SubmissionController {
  static async upload(req, res, next) {
    try {
      const info = extractClientInfo(req);
      const result = await SubmissionService.uploadSubmission({
        assignmentId: req.params.assignmentId,
        file: req.file,
        user: req.user,
        ...info,
      });
      return apiResponse.success(res, {
        statusCode: result.created ? 201 : 200,
        message: result.created ? 'Jawaban tugas berhasil dikumpulkan' : 'Jawaban tugas berhasil diperbarui',
        data: result.submission,
      });
    } catch (error) { return next(error); }
  }

  static async mySubmission(req, res, next) {
    try {
      const data = await SubmissionService.getMySubmission({ assignmentId: req.params.assignmentId, user: req.user });
      return apiResponse.success(res, { message: 'Submission mahasiswa berhasil diambil', data });
    } catch (error) { return next(error); }
  }

  static async roster(req, res, next) {
    try {
      const data = await SubmissionService.getSubmissionRoster({ assignmentId: req.params.assignmentId, user: req.user });
      return apiResponse.success(res, { message: 'Roster submission berhasil diambil', data });
    } catch (error) { return next(error); }
  }

  static async download(req, res, next) {
    try {
      const download = await SubmissionService.getSubmissionForDownload({ submissionId: req.params.id, user: req.user });
      res.attachment(download.fileName);
      res.setHeader('Content-Type', download.mimeType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'private, no-store');
      const stream = createReadStream(download.filePath);
      stream.once('error', (error) => {
        if (res.headersSent) { res.destroy(); return; }
        next(error);
      });
      return stream.pipe(res);
    } catch (error) { return next(error); }
  }

  static async grade(req, res, next) {
    try {
      const info = extractClientInfo(req);
      const submission = await SubmissionService.gradeSubmission({
        submissionId: req.params.id,
        payload: req.body,
        user: req.user,
        ...info,
      });
      return apiResponse.success(res, {
        message: 'Penilaian submission berhasil disimpan',
        data: submission,
      });
    } catch (error) { return next(error); }
  }
}
