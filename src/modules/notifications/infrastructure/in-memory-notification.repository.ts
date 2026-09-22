import {
  CreateNotificationInput,
  ListNotificationFilter,
  NotificationEntity,
  NotificationRepository,
  PaginatedNotificationResult,
} from '../application/notification.repository';
import { randomUUID } from 'node:crypto';

export class InMemoryNotificationRepository implements NotificationRepository {
  public items: NotificationEntity[] = [];

  async create(data: CreateNotificationInput): Promise<NotificationEntity> {
    const notification: NotificationEntity = {
      id: randomUUID(),
      userId: data.userId,
      title: data.title,
      body: data.body,
      type: data.type,
      readAt: null,
      metadata: data.metadata ?? null,
      createdAt: new Date(Date.now() + this.items.length * 10),
    };

    this.items.push(notification);
    return notification;
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const found = this.items.find((item) => item.id === id);
    return found ? { ...found } : null;
  }

  async listByUser(userId: string, filter: ListNotificationFilter = {}): Promise<PaginatedNotificationResult> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(filter.limit ?? 10, 100));
    const skip = (page - 1) * limit;

    let filtered = this.items.filter((item) => item.userId === userId);

    if (filter.unreadOnly) {
      filtered = filtered.filter((item) => item.readAt === null);
    }

    // Mais recentes primeiro
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const unreadCount = this.items.filter(
      (item) => item.userId === userId && item.readAt === null
    ).length;

    const paged = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paged.map((item) => ({ ...item })),
      meta: {
        total,
        unreadCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async markAsRead(id: string, userId: string): Promise<NotificationEntity | null> {
    const item = this.items.find((n) => n.id === id && n.userId === userId);
    if (!item) {
      return null;
    }

    item.readAt = new Date();
    return { ...item };
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    const now = new Date();

    for (const item of this.items) {
      if (item.userId === userId && item.readAt === null) {
        item.readAt = now;
        count++;
      }
    }

    return count;
  }

  async countUnread(userId: string): Promise<number> {
    return this.items.filter(
      (item) => item.userId === userId && item.readAt === null
    ).length;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const index = this.items.findIndex((n) => n.id === id && n.userId === userId);
    if (index === -1) {
      return false;
    }

    this.items.splice(index, 1);
    return true;
  }

  public clear(): void {
    this.items = [];
  }
}
