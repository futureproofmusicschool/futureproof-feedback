'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import PostDetail from '@/components/PostDetail';
import CommentSection from '@/components/CommentSection';
import NotificationsMenu from '@/components/NotificationsMenu';

export default function PostPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const highlightCommentId = searchParams.get('highlight');
  const notificationId = searchParams.get('notificationId');

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
    if (!username || !notificationId) return;

    const markAsRead = async () => {
      try {
        await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-username': username,
          },
          body: JSON.stringify({ notificationIds: [notificationId] }),
        });
      } catch (error) {
        console.error('Error marking notification from URL as read:', error);
      }
    };

    markAsRead();
  }, [notificationId, username]);

  if (!username) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-text-light">Loading...</h1>
        </div>
      </div>
    );
  }

  const postId = params.id as string;

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="bg-bg-medium border-b-2 border-brand-purple shadow-purple-glow sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-sm text-brand-purple-bright hover:underline"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-brand-purple-bright">Feedback</h1>
              <p className="text-xs text-brand-gray">Share your music, get feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-light">u/{username}</span>
            <NotificationsMenu username={username} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <PostDetail postId={postId} username={username} />
        <div className="mt-6">
          <CommentSection
            postId={postId}
            username={username}
            highlightCommentId={highlightCommentId}
          />
        </div>
      </main>
    </div>
  );
}
