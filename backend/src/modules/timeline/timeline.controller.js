import { TimelineService } from './timeline.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class TimelineController {
  /**
   * GET /api/timeline — Central Timeline kronologis (FR-009–FR-012).
   */
  static async getTimeline(req, res, next) {
    try {
      const result = await TimelineService.getTimeline({ user: req.user, query: req.query });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Timeline berhasil diambil',
        data: result.items,
        meta: result.window,
      });
    } catch (error) {
      return next(error);
    }
  }
}
