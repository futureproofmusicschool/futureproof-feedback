'use client';

interface AudioPlayerProps {
  url: string;
  mimeType: string;
}

export default function AudioPlayer({ url, mimeType }: AudioPlayerProps) {
  return (
    <audio 
      controls 
      controlsList="nodownload noplaybackrate"
      className="w-full"
      onContextMenu={(e) => e.preventDefault()}
    >
      <source src={url} type={mimeType} />
      Your browser does not support the audio element.
    </audio>
  );
}

