'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Feed from '@/components/Feed';
import SubmitButton from '@/components/SubmitButton';
import SubmitModal from '@/components/SubmitModal';

export default function Home() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  useEffect(() => {
    // Get username from query param or postMessage
    const u = searchParams.get('u');
    if (u) {
      setUsername(u);
    }

    // Listen for postMessage from parent
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-gray-600">Initializing application</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-reddit-orange">Arena</h1>
            <p className="text-xs text-gray-600">Music Community</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">u/{username}</span>
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

