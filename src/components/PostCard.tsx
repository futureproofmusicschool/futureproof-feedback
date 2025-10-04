'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import AudioPlayer from './AudioPlayer';
import VoteButtons from './VoteButtons';
import { formatDistanceToNow } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  genre: string;
  description: string;
  storageUrl: string;
  mimeType: string;
  durationSeconds: number;
  author: string;
  createdAt: string;
  score: number;
  userVote: number;
  commentCount: number;
}

interface PostCardProps {
  post: Post;
  username: string;
  onVote: (postId: string, value: number) => void;
}

export default function PostCard({ post, username, onVote }: PostCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCommentsClick = () => {
    const u = searchParams.get('u');
    router.push(`/posts/${post.id}?u=${u}`);
  };

  return (
    <div className="bg-bg-medium rounded-md border border-bg-light overflow-hidden hover:border-brand-gray transition">
      <div className="flex">
        <div className="w-12 bg-bg-light flex flex-col items-center pt-2">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={(value) => onVote(post.id, value)}
          />
        </div>

        <div className="flex-1 p-3">
          <div className="mb-2">
            <h2
              className="text-lg font-semibold mb-1 cursor-pointer hover:underline text-text-light"
              onClick={handleCommentsClick}
            >
              {post.title}
            </h2>
            <div className="text-xs text-brand-gray mb-1">
              Posted by u/{post.author} • {formatDistanceToNow(post.createdAt)}
            </div>
            <div className="text-xs text-brand-purple-light font-semibold">
              Genre: {post.genre}
            </div>
          </div>

          <AudioPlayer url={post.storageUrl} mimeType={post.mimeType} />

          <div className="mt-3 flex gap-4 text-sm text-brand-gray">
            <button
              onClick={handleCommentsClick}
              className="hover:bg-bg-light px-2 py-1 rounded-full transition"
            >
              💬 {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

