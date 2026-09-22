import type { NextFunction, Request, Response } from 'express';
import type { NotificationService } from '../application/notification.service';
import {
  createNotificationSchema,
  listNotificationQuerySchema,
  notificationIdParamSchema,
} from './notification.schemas';
import {
  NotificationStreamManager,
  notificationStreamManager,
} from '../infrastructure/notification-stream.manager';

function userIdFrom(req: Request): string {
  const userId = req.auth?.tutorId || req.user?.tutor_id;
  if (!userId) {
    throw new Error('Usuário não autenticado.');
  }
  return userId;
}

export class NotificationController {
  constructor(
    private readonly service: NotificationService,
    private readonly streamManager: NotificationStreamManager = notificationStreamManager,
  ) {}

  /**
   * Canal de Push Server-Sent Events (SSE) em tempo real
   * Mantém a conexão aberta e envia notificações instantâneas
   */
  stream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = userIdFrom(req);
      const cleanup = this.streamManager.addClient(userId, res);

      // Limpeza de recursos e término do stream na desconexão
      req.on('close', () => {
        cleanup();
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista notificações do usuário logado com paginação e filtro unreadOnly
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = userIdFrom(req);
      const filter = listNotificationQuerySchema.parse(req.query);
      const result = await this.service.listNotifications(userId, filter);

      res.status(200).json({
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca uma notificação específica como lida
   */
  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = userIdFrom(req);
      const { id } = notificationIdParamSchema.parse(req.params);
      const updated = await this.service.markAsRead(id, userId);

      res.status(200).json({
        data: updated,
        message: 'Notificação marcada como lida com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Marca todas as notificações não lidas do usuário como lidas
   */
  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = userIdFrom(req);
      const result = await this.service.markAllAsRead(userId);

      res.status(200).json({
        message: 'Todas as notificações foram marcadas como lidas.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Criação de notificação e despacho instantâneo
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = userIdFrom(req);
      const payload = createNotificationSchema.parse(req.body);

      const targetUserId = payload.targetUserId || currentUserId;

      const created = await this.service.createNotification({
        userId: targetUserId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        metadata: payload.metadata,
      });

      res.status(201).json({
        data: created,
        message: 'Notificação criada e enviada com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retorna apenas a contagem de não lidas para o badge
   */
  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = userIdFrom(req);
      const unreadCount = await this.service.getUnreadCount(userId);

      res.status(200).json({
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  };
}
