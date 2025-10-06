'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from '@/lib/utils';
import { NotificationItem } from '@/types/notifications';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <NotificationsPageContent />
    </Suspense>
  );
}

function NotificationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = searchParams.get('u');
    if (u) {
      setUsername(u);
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.username) {
        setUsername(event.data.username);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams]);

  useEffect(() => {
    if (!username) {
      return;
    }

    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        { type: 'resize', height },
        '*'
      );
    };

    sendHeight();

    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    const interval = setInterval(sendHeight, 500);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [username, notifications.length]);

  const fetchNotifications = useCallback(async () => {
    if (!username) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications?status=all', {
        headers: {
          'x-username': username,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data: NotificationItem[] = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('We could not load your notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!username) {
      return;
    }

    if (!item.isRead) {
      try {
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-username': username,
          },
          body: JSON.stringify({ notificationIds: [item.id] }),
        });
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === item.id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    const params = new URLSearchParams();
    params.set('u', username);
    params.set('highlight', item.commentId);
    params.set('notificationId', item.id);
    router.push(`/posts/${item.postId}?${params.toString()}`);
  };

  const handleMarkAllAsRead = async () => {
    if (!username || unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);
    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: {
          'x-username': username,
        },
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('We could not mark everything as read. Please try again.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (!username) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-light">
      <header className="bg-bg-medium border-b-2 border-brand-purple shadow-purple-glow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-brand-purple-bright">Feedback</h1>
            <p className="text-xs text-brand-gray">Notifications</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href={`/?u=${encodeURIComponent(username)}`}
              className="text-brand-purple-bright hover:underline font-bold"
            >
              Back to feed
            </Link>
            <span className="text-text-light">u/{username}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMarkingAll}
            className="text-sm text-brand-purple-bright hover:underline disabled:opacity-50 font-bold"
          >
            Mark all as read
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-brand-gray">Loading notifications...</p>
        ) : error ? (
          <div className="bg-bg-medium border-2 border-brand-purple rounded-lg p-4 text-sm text-brand-gray">
            {error}
            <button
              onClick={fetchNotifications}
              className="block mt-2 text-brand-purple-bright hover:underline font-bold"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-brand-gray">You have no notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left rounded-lg border-2 transition p-4 flex gap-3 items-start ${
                    item.isRead
                      ? 'bg-bg-medium border-bg-medium hover:border-brand-purple'
                      : 'bg-bg-light border-brand-purple hover:border-brand-purple-bright shadow-purple-glow'
                  }`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-lg">
                    {item.type === 'REPLY_TO_COMMENT' ? '💬' : '⬆️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {item.type === 'REPLY_TO_COMMENT'
                        ? `u/${item.actor} replied to your comment`
                        : `u/${item.actor} commented on your post`}
                    </p>
                    <p className="text-sm text-brand-purple-bright font-bold mt-1">
                      {item.postTitle}
                    </p>
                    <p className="text-sm text-brand-gray mt-1">
                      {item.commentSnippet || 'View comment'}
                    </p>
                    <p className="text-xs text-brand-gray mt-2">
                      {formatDistanceToNow(item.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2 text-text-light">Loading...</h1>
        <p className="text-brand-gray">Initializing application</p>
      </div>
    </div>
  );
}
