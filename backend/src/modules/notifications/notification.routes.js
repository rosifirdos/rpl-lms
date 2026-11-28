import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  notificationListQuerySchema,
  notificationIdParamSchema,
} from './notification.dto.js';

const router = Router();

router.use(authenticateToken);

/** GET /api/notifications — daftar notifikasi pengguna (FR-057). */
router.get('/', validate(notificationListQuerySchema), NotificationController.listNotifications);

/** GET /api/notifications/unread-count — jumlah belum dibaca. */
router.get('/unread-count', NotificationController.getUnreadCount);

/** PATCH /api/notifications/read-all — tandai semua dibaca. */
router.patch('/read-all', NotificationController.markAllAsRead);

/** PATCH /api/notifications/:id/read — tandai satu dibaca. */
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema),
  NotificationController.markAsRead
);

export default router;
