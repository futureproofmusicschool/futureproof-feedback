export type NotificationType = 'COMMENT_ON_POST' | 'REPLY_TO_COMMENT';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  postId: string;
  postTitle: string;
  commentId: string;
  commentSnippet: string;
  actor: string;
}
