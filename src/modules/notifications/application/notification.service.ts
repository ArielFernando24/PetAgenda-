import {
  CreateNotificationInput,
  ListNotificationFilter,
  NotificationEntity,
  NotificationRepository,
  PaginatedNotificationResult,
} from './notification.repository';
import {
  NotificationStreamManager,
  notificationStreamManager,
} from '../infrastructure/notification-stream.manager';
import { AppError } from '../../../middlewares/error.middleware';

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly streamManager: NotificationStreamManager = notificationStreamManager,
  ) {}

  /**
   * Cria uma notificação no banco de dados e a despacha imediatamente
   * em tempo real para os dispositivos conectados do usuário via SSE.
   */
  async createNotification(data: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.repository.create(data);

    // Contagem atualizada de não lidas
    const unreadCount = await this.repository.countUnread(data.userId);

    // Despacho instantâneo em tempo real via SSE
    this.streamManager.sendToUser(data.userId, 'notification', {
      notification,
      unreadCount,
    });

    this.streamManager.sendToUser(data.userId, 'unread_count_update', {
      unreadCount,
    });

    return notification;
  }

  /**
   * Lista as notificações do usuário com suporte a paginação e contagem de não lidas.
   */
  async listNotifications(
    userId: string,
    filter: ListNotificationFilter = {},
  ): Promise<PaginatedNotificationResult> {
    return this.repository.listByUser(userId, filter);
  }

  /**
   * Marca uma notificação individual como lida e atualiza o badge do sininho.
   */
  async markAsRead(id: string, userId: string): Promise<NotificationEntity> {
    const notification = await this.repository.markAsRead(id, userId);

    if (!notification) {
      throw new AppError('Notificação não encontrada ou não pertence ao usuário.', 404);
    }

    const unreadCount = await this.repository.countUnread(userId);

    // Notifica em tempo real para decrementar o contador visual
    this.streamManager.sendToUser(userId, 'unread_count_update', {
      unreadCount,
      readNotificationId: id,
    });

    return notification;
  }

  /**
   * Marca todas as notificações do usuário como lidas e zera o contador.
   */
  async markAllAsRead(userId: string): Promise<{ count: number; unreadCount: number }> {
    const count = await this.repository.markAllAsRead(userId);

    // Notifica em tempo real para zerar o contador visual
    this.streamManager.sendToUser(userId, 'unread_count_update', {
      unreadCount: 0,
      markedCount: count,
    });

    return { count, unreadCount: 0 };
  }

  /**
   * Retorna apenas o contador de notificações não lidas.
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }
}
