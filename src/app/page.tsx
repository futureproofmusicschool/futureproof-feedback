'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Feed from '@/components/Feed';
import SubmitButton from '@/components/SubmitButton';
import SubmitModal from '@/components/SubmitModal';
import NotificationsMenu from '@/components/NotificationsMenu';

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [shouldRedirectToNotifications, setShouldRedirectToNotifications] = useState(false);

  useEffect(() => {
    // Get username from query param or postMessage
    const u = searchParams.get('u');
    if (u) {
      setUsername(u);
    }

    const notificationsParam = searchParams.get('notifications');
    setShouldRedirectToNotifications(Boolean(notificationsParam));

    // Listen for postMessage from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.username) {
        setUsername(event.data.username);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [searchParams]);

  // Send height updates to parent iframe
  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        { type: 'resize', height },
        '*'
      );
    };

    // Send initial height
    sendHeight();

    // Send height on resize
    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    // Send height periodically (catches dynamic content)
    const interval = setInterval(sendHeight, 500);

    return () => {
      resizeObserver.disconnect();
      clearInterval(interval);
    };
  }, [username]);

  useEffect(() => {
    if (!shouldRedirectToNotifications || !username) {
      return;
    }

    const params = new URLSearchParams();
    params.set('u', username);
    router.replace(`/notifications?${params.toString()}`);
  }, [router, shouldRedirectToNotifications, username]);

  if (!username) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="bg-bg-medium border-b-2 border-brand-purple shadow-purple-glow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <a
              href={`/?u=${encodeURIComponent(username)}`}
              className="text-xl font-bold text-brand-purple-bright hover:underline"
            >
              Feedback Forum
            </a>
            <p className="text-xs text-brand-gray">Share your music, get feedback</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-light">u/{username}</span>
            <NotificationsMenu username={username} />
            <SubmitButton onClick={() => setIsSubmitModalOpen(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Feed username={username} />
      </main>

      {isSubmitModalOpen && (
        <SubmitModal
          username={username}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}
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
