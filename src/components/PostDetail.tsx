'use client';

import { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer';
import VoteButtons from './VoteButtons';
import { formatDistanceToNow } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
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
    return <div className="text-center py-8">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  return (
    <div className="bg-white rounded-md border border-gray-300">
      <div className="flex">
        <div className="w-12 bg-gray-50 flex flex-col items-center pt-4">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={handleVote}
          />
        </div>

        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          <div className="text-sm text-gray-600 mb-4">
            Posted by u/{post.author} • {formatDistanceToNow(post.createdAt)}
          </div>

          <AudioPlayer url={post.storageUrl} mimeType={post.mimeType} />
        </div>
      </div>
    </div>
  );
}

