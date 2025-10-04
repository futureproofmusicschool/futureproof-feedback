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
          userVote === 1 ? 'text-brand-purple-bright' : 'text-brand-gray hover:text-brand-purple-bright'
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`text-sm font-bold ${
          userVote === 1
            ? 'text-brand-purple-bright'
            : userVote === -1
            ? 'text-brand-purple-bright'
            : 'text-text-light'
        }`}
      >
        {score}
      </span>
      <button
        onClick={handleDownvote}
        className={`text-xl ${
          userVote === -1 ? 'text-brand-purple-bright' : 'text-brand-gray hover:text-brand-purple-bright'
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

