'use client';

import { useState, useRef } from 'react';

interface SubmitModalProps {
  username: string;
  onClose: () => void;
}

export default function SubmitModal({ username, onClose }: SubmitModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Please select an audio file (MP3 or WAV)');
      return;
    }

    // Validate file size (50 MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50 MB');
      return;
    }

    // Validate duration using Web Audio API
    try {
      const duration = await getAudioDuration(selectedFile);
      if (duration >= 600) {
        setError('Audio duration must be less than 10 minutes');
        return;
      }
      setFile(selectedFile);
      setError('');
    } catch (err) {
      setError('Failed to read audio file');
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };

      audio.onerror = () => {
        reject(new Error('Failed to load audio'));
      };

      audio.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !file) {
      setError('Please provide a title and select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get audio duration
      const duration = await getAudioDuration(file);

      // Step 1: Get signed upload URL
      const signedUrlResponse = await fetch('/api/upload/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!signedUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, filePath } = await signedUrlResponse.json();

      // Step 2: Upload file to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Create post
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': username,
        },
        body: JSON.stringify({
          title,
          filePath: filePath,
          mimeType: file.type,
          durationSeconds: duration,
        }),
      });

      if (!postResponse.ok) {
        throw new Error('Failed to create post');
      }

      // Success! Close modal and refresh
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Submit a Track</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-reddit-blue"
              placeholder="Give your track a title"
              disabled={uploading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File (MP3 or WAV, &lt; 10 minutes)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav"
              onChange={handleFileChange}
              className="w-full"
              disabled={uploading}
            />
            {file && (
              <p className="mt-2 text-sm text-green-600">
                ✓ {file.name} selected
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-reddit-orange text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !title || !file}
            >
              {uploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

