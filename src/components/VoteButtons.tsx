'use client';

interface VoteButtonsProps {
  score: number;
  userVote: number;
  onVote: (value: number) => void;
}

export default function VoteButtons({ score, userVote, onVote }: VoteButtonsProps) {
  const handleUpvote = () => {
    onVote(userVote === 1 ? 0 : 1);
  };

  const handleDownvote = () => {
    onVote(userVote === -1 ? 0 : -1);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleUpvote}
        className={`text-xl ${
          userVote === 1 ? 'text-brand-purple-light' : 'text-brand-gray hover:text-brand-purple-light'
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`text-sm font-bold ${
          userVote === 1
            ? 'text-brand-purple-light'
            : userVote === -1
            ? 'text-brand-purple'
            : 'text-text-light'
        }`}
      >
        {score}
      </span>
      <button
        onClick={handleDownvote}
        className={`text-xl ${
          userVote === -1 ? 'text-brand-purple' : 'text-brand-gray hover:text-brand-purple'
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

