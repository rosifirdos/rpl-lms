import { NotificationService } from './notification.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class NotificationController {
  /** GET /api/notifications */
  static async listNotifications(req, res, next) {
    try {
      const result = await NotificationService.listNotifications({
        userId: req.user.id,
        user: req.user,
        query: req.query,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar notifikasi berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** GET /api/notifications/unread-count */
  static async getUnreadCount(req, res, next) {
    try {
      const result = await NotificationService.getUnreadCount({
        userId: req.user.id,
        user: req.user,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Jumlah notifikasi belum dibaca berhasil diambil',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PATCH /api/notifications/:id/read */
  static async markAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAsRead({
        notificationId: req.params.id,
        userId: req.user.id,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Notifikasi ditandai telah dibaca',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /** PATCH /api/notifications/read-all */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead({ userId: req.user.id });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Seluruh notifikasi ditandai telah dibaca',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
