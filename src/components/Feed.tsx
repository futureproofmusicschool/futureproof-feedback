'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';

type SortOption = 'hot' | 'new' | 'top';

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

interface FeedProps {
  username: string;
}

export default function Feed({ username }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortOption>('hot');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [sort, username]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?sort=${sort}`, {
        headers: {
          'x-username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, value: number) => {
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
        // Refresh posts
        fetchPosts();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  return (
    <div>
      <div className="bg-bg-medium rounded-md p-3 mb-4 flex gap-2 border border-bg-light">
        {(['hot', 'new', 'top'] as SortOption[]).map((option) => (
          <button
            key={option}
            onClick={() => setSort(option)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
              sort === option
                ? 'bg-brand-purple text-white'
                : 'bg-bg-light text-brand-gray hover:bg-bg-light hover:text-text-light'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-brand-gray">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="bg-bg-medium rounded-md p-8 text-center border border-bg-light">
          <p className="text-brand-gray">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              username={username}
              onVote={handleVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

