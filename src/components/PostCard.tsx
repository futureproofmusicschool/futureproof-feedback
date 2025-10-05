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
    <div className="bg-bg-medium rounded-lg border-2 border-brand-purple shadow-purple-glow overflow-hidden hover:border-brand-purple-bright hover:shadow-purple-glow-lg transition">
      <div className="flex">
        <div className="w-12 bg-bg-light flex flex-col items-center pt-2">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={(value) => onVote(post.id, value)}
          />
        </div>

        <div className="flex-1 p-3">
          <div className="flex justify-between items-start mb-2">
            <h2
              className="text-lg font-bold cursor-pointer hover:underline text-text-light flex-1"
              onClick={handleCommentsClick}
            >
              {post.title}
            </h2>
            <div className="text-right ml-4">
              <div className="text-xs text-brand-gray whitespace-nowrap">
                Posted by u/{post.author} • {formatDistanceToNow(post.createdAt)}
              </div>
              <div className="text-xs text-brand-purple-bright font-bold">
                Genre: {post.genre}
              </div>
            </div>
          </div>

          <AudioPlayer url={post.storageUrl} mimeType={post.mimeType} />

          {post.description && (
            <div className="mt-3 p-3 bg-bg-light rounded-md border-2 border-brand-purple">
              <p className="text-sm text-brand-gray whitespace-pre-wrap line-clamp-3">{post.description}</p>
            </div>
          )}

          <div className="mt-3 flex gap-4 text-sm text-brand-gray">
            <button
              onClick={handleCommentsClick}
              className="hover:bg-bg-light hover:text-brand-purple-bright px-2 py-1 rounded-full transition font-semibold"
            >
              💬 {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

