import { z } from 'zod';

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'O título da notificação é obrigatório').max(150, 'Título muito longo'),
  body: z.string().min(1, 'O corpo da notificação é obrigatório'),
  type: z.string().min(1, 'O tipo da notificação é obrigatório').max(50),
  metadata: z.record(z.unknown()).optional(),
  targetUserId: z.string().uuid().optional(), // Para criação administrativa/interna direcionada
});

export const listNotificationQuerySchema = z.object({
  unreadOnly: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val === 'true' || val === '1';
    }
    return Boolean(val);
  }, z.boolean().optional()),
  page: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().int().positive().max(100).default(10)),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid('ID de notificação inválido'),
});

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;
export type ListNotificationQueryDTO = z.infer<typeof listNotificationQuerySchema>;
