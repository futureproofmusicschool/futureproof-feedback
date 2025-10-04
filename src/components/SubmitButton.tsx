'use client';

interface SubmitButtonProps {
  onClick: () => void;
}

export default function SubmitButton({ onClick }: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-purple text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-brand-purple-bright shadow-purple-glow hover:shadow-purple-glow-lg transition"
    >
      Submit Track
    </button>
  );
}

