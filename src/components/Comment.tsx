'use client';

import { useState } from 'react';
import VoteButtons from './VoteButtons';
import { formatDistanceToNow } from '@/lib/utils';

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

interface CommentProps {
  comment: CommentData;
  allComments: CommentData[];
  onVote: (commentId: string, value: number) => void;
  onReply: (parentCommentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
  username: string;
  depth?: number;
  highlightCommentId?: string;
}

export default function Comment({
  comment,
  allComments,
  onVote,
  onReply,
  onDelete,
  username,
  depth = 0,
  highlightCommentId,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const replies = allComments.filter((c) => c.parentCommentId === comment.id);
  const isHighlighted = highlightCommentId === comment.id;

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyBody.trim()) {
      onReply(comment.id, replyBody);
      setReplyBody('');
      setIsReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-bg-light pl-4' : ''}`}>
      <div
        id={`comment-${comment.id}`}
        className={`flex gap-2 ${isHighlighted ? 'bg-bg-light border border-brand-purple-light rounded-md p-2 shadow-lg' : ''}`}
      >
        <div className="w-8">
          <VoteButtons
            score={comment.score}
            userVote={comment.userVote}
            onVote={(value) => onVote(comment.id, value)}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs text-brand-gray mb-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:underline font-semibold text-text-light"
            >
              u/{comment.author}
            </button>{' '}
            • {formatDistanceToNow(comment.createdAt)}
            {isCollapsed && ` • [${1 + replies.length} collapsed]`}
          </div>

          {!isCollapsed && (
            <>
              <p className="text-sm mb-2 whitespace-pre-wrap text-text-light">{comment.body}</p>

              <div className="flex gap-3 text-xs text-brand-gray">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:underline hover:text-brand-purple-light"
                >
                  Reply
                </button>
                {comment.author === username && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="hover:underline hover:text-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>

              {isReplying && (
                <form onSubmit={handleSubmitReply} className="mt-3">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-light border border-brand-gray rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none text-sm text-text-light"
                    rows={3}
                    placeholder="Write your reply..."
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-brand-purple text-white rounded-full text-xs font-semibold hover:bg-brand-purple-light"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyBody('');
                      }}
                      className="px-3 py-1 text-text-light hover:bg-bg-light rounded-full text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {replies.length > 0 && (
                <div className="mt-4 space-y-4">
                  {replies.map((reply) => (
                    <Comment
                      key={reply.id}
                      comment={reply}
                      allComments={allComments}
                      onVote={onVote}
                      onReply={onReply}
                      onDelete={onDelete}
                      username={username}
                      depth={depth + 1}
                      highlightCommentId={highlightCommentId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
