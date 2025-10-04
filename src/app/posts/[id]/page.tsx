'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import PostDetail from '@/components/PostDetail';
import CommentSection from '@/components/CommentSection';

export default function PostPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

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
      <header className="bg-bg-medium border-b border-bg-light sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-sm text-brand-purple-light hover:underline"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-brand-purple-light">Feedback</h1>
              <p className="text-xs text-brand-gray">Share your music, get feedback</p>
            </div>
          </div>
          <span className="text-sm text-text-light">u/{username}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <PostDetail postId={postId} username={username} />
        <div className="mt-6">
          <CommentSection postId={postId} username={username} />
        </div>
      </main>
    </div>
  );
}

