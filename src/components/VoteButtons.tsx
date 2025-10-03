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
          userVote === 1 ? 'text-reddit-orange' : 'text-gray-400 hover:text-reddit-orange'
        }`}
        aria-label="Upvote"
      >
        ▲
      </button>
      <span
        className={`text-sm font-bold ${
          userVote === 1
            ? 'text-reddit-orange'
            : userVote === -1
            ? 'text-reddit-blue'
            : 'text-gray-700'
        }`}
      >
        {score}
      </span>
      <button
        onClick={handleDownvote}
        className={`text-xl ${
          userVote === -1 ? 'text-reddit-blue' : 'text-gray-400 hover:text-reddit-blue'
        }`}
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

