'use client';

import { useEffect, useState } from 'react';
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

interface PostDetailProps {
  postId: string;
  username: string;
}

export default function PostDetail({ postId, username }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'x-username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value: number) => {
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        fetchPost();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-brand-gray">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-8 text-brand-gray">Post not found</div>;
  }

  return (
    <div className="bg-bg-medium rounded-md border border-bg-light">
      <div className="flex">
        <div className="w-12 bg-bg-light flex flex-col items-center pt-4">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={handleVote}
          />
        </div>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-2 text-text-light">{post.title}</h1>
          <div className="text-sm text-brand-gray mb-1">
            Posted by u/{post.author} • {formatDistanceToNow(post.createdAt)}
          </div>
          <div className="text-sm text-brand-purple-light font-semibold mb-4">
            Genre: {post.genre}
          </div>

          <AudioPlayer url={post.storageUrl} mimeType={post.mimeType} />

          <div className="mt-4 p-3 bg-bg-light rounded-md border border-bg-light">
            <h3 className="text-sm font-semibold text-text-light mb-2">Description</h3>
            <p className="text-sm text-brand-gray whitespace-pre-wrap">{post.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

