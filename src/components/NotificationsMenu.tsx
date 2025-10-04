'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from '@/lib/utils';

type NotificationType = 'COMMENT_ON_POST' | 'REPLY_TO_COMMENT';

interface NotificationItem {
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

interface NotificationsMenuProps {
  username: string;
}

export default function NotificationsMenu({ username }: NotificationsMenuProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications?status=unread', {
        headers: {
          'x-username': username,
        },
      });

      if (response.ok) {
        const data: NotificationItem[] = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const unreadCount = notifications.length;

  const getMessage = (item: NotificationItem) => {
    if (item.type === 'REPLY_TO_COMMENT') {
      return `u/${item.actor} replied to your comment`;
    }

    return `u/${item.actor} commented on your post`;
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({ notificationIds: [item.id] }),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setNotifications((current) => current.filter((n) => n.id !== item.id));
      setIsOpen(false);
      const params = new URLSearchParams(searchParams.toString());
      params.set('u', username);
      params.set('highlight', item.commentId);
      params.set('notificationId', item.id);
      router.push(`/posts/${item.postId}?${params.toString()}`);
    }
  };

  const handleToggle = async () => {
    if (!isOpen) {
      await fetchNotifications();
    }
    setIsOpen((prev) => !prev);
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) {
      setIsOpen(false);
      return;
    }

    setIsClearing(true);
    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: {
          'x-username': username,
        },
      });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    } finally {
      setIsClearing(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative w-8 h-8 rounded-full bg-brand-purple text-white text-sm font-bold flex items-center justify-center hover:bg-brand-purple-bright shadow-purple-glow hover:shadow-purple-glow-lg transition"
        aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {unreadCount}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div className="absolute right-4 top-20 w-80 max-w-full bg-bg-medium border-2 border-brand-purple rounded-lg shadow-purple-glow-lg p-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-light">Notifications</h2>
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="text-xs text-brand-purple-bright hover:underline disabled:opacity-50 font-bold"
              >
                Clear all
              </button>
            </div>

            {isLoading ? (
              <p className="text-xs text-brand-gray">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-xs text-brand-gray">You're all caught up!</p>
            ) : (
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNotificationClick(item)}
                      className="w-full text-left bg-bg-light border-2 border-brand-purple rounded-md p-3 hover:border-brand-purple-bright hover:shadow-purple-glow transition"
                    >
                      <p className="text-xs text-text-light font-bold mb-1">
                        {getMessage(item)}
                      </p>
                      <p className="text-xs text-brand-purple-bright font-bold truncate">
                        {item.postTitle}
                      </p>
                      <p className="text-xs text-brand-gray mt-1 truncate">
                        {item.commentSnippet || 'View comment'}
                      </p>
                      <p className="text-[10px] text-brand-gray mt-2">
                        {formatDistanceToNow(item.createdAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
