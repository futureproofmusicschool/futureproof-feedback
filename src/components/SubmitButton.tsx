'use client';

interface SubmitButtonProps {
  onClick: () => void;
}

export default function SubmitButton({ onClick }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-purple text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-purple-light transition"
    >
      Submit Track
    </button>
  );
}

