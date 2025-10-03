'use client';

interface SubmitButtonProps {
  onClick: () => void;
}

export default function SubmitButton({ onClick }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-reddit-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition"
    >
      Submit Track
    </button>
  );
}

