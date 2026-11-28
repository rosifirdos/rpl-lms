import { z } from 'zod';
import { NotificationType } from '../../constants/notifications.js';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const notificationListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    is_read: z
      .enum(['true', 'false'], { message: 'Parameter is_read harus bernilai true atau false' })
      .optional(),
    type: z.enum(Object.values(NotificationType), {
      message: 'Tipe notifikasi tidak dikenal',
    }).optional(),
  }),
};

export const notificationIdParamSchema = {
  params: z.object({
    id: uuid('ID notifikasi'),
  }),
};
