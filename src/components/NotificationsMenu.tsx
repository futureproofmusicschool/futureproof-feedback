'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationItem } from '@/types/notifications';

interface NotificationsMenuProps {
  username: string;
}

export default function NotificationsMenu({ username }: NotificationsMenuProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    const handleFocus = () => {
      fetchNotifications();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const handleNavigateToNotifications = () => {
    const params = new URLSearchParams();
    params.set('u', username);
    router.push(`/notifications?${params.toString()}`);
  };

  return (
    <button
      onClick={handleNavigateToNotifications}
      className="relative w-8 h-8 rounded-full bg-brand-purple text-white text-sm font-bold flex items-center justify-center hover:bg-brand-purple-bright shadow-purple-glow hover:shadow-purple-glow-lg transition"
      aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      {isLoading ? '…' : unreadCount}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-purple-bright rounded-full border border-white" />
      )}
    </button>
  );
}
