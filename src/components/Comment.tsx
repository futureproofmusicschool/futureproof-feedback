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
  username: string;
  depth?: number;
}

export default function Comment({
  comment,
  allComments,
  onVote,
  onReply,
  username,
  depth = 0,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const replies = allComments.filter((c) => c.parentCommentId === comment.id);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyBody.trim()) {
      onReply(comment.id, replyBody);
      setReplyBody('');
      setIsReplying(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-2">
        <div className="w-8">
          <VoteButtons
            score={comment.score}
            userVote={comment.userVote}
            onVote={(value) => onVote(comment.id, value)}
          />
        </div>

        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hover:underline font-medium"
            >
              u/{comment.author}
            </button>{' '}
            • {formatDistanceToNow(comment.createdAt)}
            {isCollapsed && ` • [${1 + replies.length} collapsed]`}
          </div>

          {!isCollapsed && (
            <>
              <p className="text-sm mb-2 whitespace-pre-wrap">{comment.body}</p>

              <div className="flex gap-3 text-xs text-gray-600">
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:underline"
                >
                  Reply
                </button>
              </div>

              {isReplying && (
                <form onSubmit={handleSubmitReply} className="mt-3">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-reddit-blue resize-none text-sm"
                    rows={3}
                    placeholder="Write your reply..."
                    autoFocus
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-reddit-blue text-white rounded-full text-xs font-medium hover:bg-blue-600"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplying(false);
                        setReplyBody('');
                      }}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-full text-xs"
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
                      username={username}
                      depth={depth + 1}
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

