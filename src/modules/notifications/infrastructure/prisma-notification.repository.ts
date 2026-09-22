import { prisma } from '../../../config/prisma';
import { Prisma } from '@prisma/client';
import {
  CreateNotificationInput,
  ListNotificationFilter,
  NotificationEntity,
  NotificationRepository,
  PaginatedNotificationResult,
} from '../application/notification.repository';

export class PrismaNotificationRepository implements NotificationRepository {
  async create(data: CreateNotificationInput): Promise<NotificationEntity> {
    const created = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const found = await prisma.notification.findUnique({
      where: { id },
    });

    return found ? this.mapToEntity(found) : null;
  }

  async listByUser(userId: string, filter: ListNotificationFilter = {}): Promise<PaginatedNotificationResult> {
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.max(1, Math.min(filter.limit ?? 10, 100));
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(filter.unreadOnly ? { readAt: null } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          readAt: null,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items.map(this.mapToEntity),
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
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return null;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        readAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return result.count;
  }

  async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return false;
    }

    await prisma.notification.delete({
      where: { id },
    });

    return true;
  }

  private mapToEntity(row: any): NotificationEntity {
    return {
      id: row.id,
      userId: row.userId,
      title: row.title,
      body: row.body,
      type: row.type,
      readAt: row.readAt,
      metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : null,
      createdAt: row.createdAt,
    };
  }
}
