export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  readAt: Date | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: string;
  metadata?: Record<string, unknown> | null;
}

export interface ListNotificationFilter {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationResult {
  data: NotificationEntity[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface NotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  listByUser(userId: string, filter?: ListNotificationFilter): Promise<PaginatedNotificationResult>;
  markAsRead(id: string, userId: string): Promise<NotificationEntity | null>;
  markAllAsRead(userId: string): Promise<number>;
  countUnread(userId: string): Promise<number>;
  delete(id: string, userId: string): Promise<boolean>;
}
