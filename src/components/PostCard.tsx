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
  coverImageUrl?: string | null;
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
      <div className="flex flex-col md:flex-row">
        <div className="order-1 w-full md:order-1 md:w-12 bg-bg-light flex items-center justify-center md:justify-start md:flex-col md:items-center gap-2 px-4 py-2 md:px-0 md:pt-2 border-b md:border-b-0 md:border-r border-brand-purple/40">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={(value) => onVote(post.id, value)}
          />
        </div>

        <div className="order-2 md:order-2 flex-1 p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
            <h2
              className="text-lg font-bold cursor-pointer hover:underline text-text-light"
              onClick={handleCommentsClick}
            >
              {post.title}
            </h2>
            <div className="text-sm text-brand-gray md:text-right">
              <div className="text-xs text-brand-gray">
                Posted by u/{post.author} • {formatDistanceToNow(post.createdAt)}
              </div>
              <div className="text-xs text-brand-purple-bright font-bold mt-1 md:mt-0">
                Genre: {post.genre}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Cover Image */}
            <div className="sm:w-24 w-full flex-shrink-0">
              <img
                src={post.coverImageUrl || '/placeholder-cover.jpg'}
                alt={`${post.title} cover`}
                className="w-full h-24 sm:h-24 rounded-md object-cover border-2 border-brand-purple"
              />
            </div>

            {/* Audio Player */}
            <div className="flex-1 min-w-0">
              <AudioPlayer url={post.storageUrl} mimeType={post.mimeType} />
            </div>
          </div>

          {post.description && (
            <div className="mt-4 p-3 bg-bg-light rounded-md border-2 border-brand-purple">
              <p className="text-sm text-brand-gray whitespace-pre-wrap">{post.description}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-sm text-brand-gray">
            <button
              onClick={handleCommentsClick}
              className="hover:bg-bg-light hover:text-brand-purple-bright px-3 py-1 rounded-full transition font-semibold"
            >
              💬 {post.commentCount} {post.commentCount === 1 ? 'Comment' : 'Comments'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
