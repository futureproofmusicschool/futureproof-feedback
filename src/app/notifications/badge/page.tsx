'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import NotificationsMenu from '@/components/NotificationsMenu';

export default function NotificationsBadgePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <NotificationsBadgeContent />
    </Suspense>
  );
}

function NotificationsBadgeContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('u');

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <p className="text-xs text-brand-gray">
          Add ?u=USERNAME to load the notifications badge.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <NotificationsMenu
        username={username}
        target="parent"
        notificationsHrefBuilder={(user) =>
          `https://learn.futureproofmusicschool.com/feedback?u=${encodeURIComponent(
            user
          )}&notifications=open`
        }
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white text-sm font-bold">
        …
      </div>
    </div>
  );
}
