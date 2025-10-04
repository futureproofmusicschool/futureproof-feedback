'use client';

import { useEffect, useState } from 'react';
import Comment from './Comment';

interface CommentData {
  id: string;
  postId: string;
  parentCommentId: string | null;
  body: string;
  author: string;
  createdAt: string;
  score: number;
  userVote: number;
}

interface CommentSectionProps {
  postId: string;
  username: string;
  highlightCommentId?: string | null;
}

export default function CommentSection({ postId, username, highlightCommentId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (!highlightCommentId) return;

    const element = document.getElementById(`comment-${highlightCommentId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('ring-2', 'ring-brand-purple-bright');

    const timeout = window.setTimeout(() => {
      element.classList.remove('ring-2', 'ring-brand-purple-bright');
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [comments, highlightCommentId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`, {
        headers: {
          'x-username': username,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCommentBody.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({
          postId,
          body: newCommentBody,
        }),
      });

      if (response.ok) {
        setNewCommentBody('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteComment = async (commentId: string, value: number) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleReply = async (parentCommentId: string, body: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({
          postId,
          parentCommentId,
          body,
        }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: 'DELETE',
        headers: {
          'x-username': username,
        },
      });

      if (response.ok) {
        fetchComments();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  // Build comment tree
  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="bg-bg-medium rounded-lg border-2 border-brand-purple shadow-purple-glow p-4">
      <h2 className="text-lg font-bold mb-4 text-text-light">Comments</h2>

      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newCommentBody}
          onChange={(e) => setNewCommentBody(e.target.value)}
          className="w-full px-3 py-2 bg-bg-light border-2 border-brand-purple rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple-bright focus:border-brand-purple-bright resize-none text-text-light"
          rows={3}
          placeholder="What are your thoughts?"
          disabled={submitting}
        />
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-brand-purple text-white rounded-full text-sm font-bold hover:bg-brand-purple-bright shadow-purple-glow hover:shadow-purple-glow-lg disabled:opacity-50 transition"
            disabled={submitting || !newCommentBody.trim()}
          >
            {submitting ? 'Commenting...' : 'Comment'}
          </button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-brand-gray text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              allComments={comments}
              onVote={handleVoteComment}
              onReply={handleReply}
              onDelete={handleDeleteComment}
              username={username}
              highlightCommentId={highlightCommentId ?? undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
