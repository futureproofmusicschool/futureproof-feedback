'use client';

import { useState, useRef } from 'react';

interface SubmitModalProps {
  username: string;
  onClose: () => void;
}

export default function SubmitModal({ username, onClose }: SubmitModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
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

    if (!title || !genre || !description || !file) {
      setError('Please provide all required fields and select a file');
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
          genre,
          description,
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-medium rounded-lg max-w-3xl w-full p-6 border-2 border-brand-purple shadow-purple-glow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-light">Submit a Track</h2>
          <button
            onClick={onClose}
            className="text-brand-gray hover:text-text-light text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-bg-light border-2 border-brand-purple rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple-bright focus:border-brand-purple-bright text-text-light"
              placeholder="Give your track a title"
              disabled={uploading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-2">
              Genre
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 bg-bg-light border-2 border-brand-purple rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple-bright focus:border-brand-purple-bright text-text-light"
              disabled={uploading}
            >
              <option value="">Select a genre...</option>
              <option value="Ambient">Ambient</option>
              <option value="Drum & Bass">Drum & Bass</option>
              <option value="Dubstep">Dubstep</option>
              <option value="Experimental">Experimental</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="House">House</option>
              <option value="Hyperpop">Hyperpop</option>
              <option value="Other">Other</option>
              <option value="Pop">Pop</option>
              <option value="Techno">Techno</option>
              <option value="UKG">UKG</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-2">
              Description (max 2 paragraphs)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-bg-light border-2 border-brand-purple rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple-bright focus:border-brand-purple-bright text-text-light resize-none"
              rows={6}
              maxLength={500}
              placeholder="Tell us something about how you made the track, what you were going for, and what kind of feedback you're looking for."
              disabled={uploading}
            />
            <div className="text-xs text-brand-gray text-right mt-1">
              {description.length}/500 characters
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-text-light mb-2">
              Audio File (MP3 or WAV, &lt; 10 minutes)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav"
              onChange={handleFileChange}
              className="w-full text-brand-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:text-white hover:file:bg-brand-purple-light"
              disabled={uploading}
            />
            {file && (
              <p className="mt-2 text-sm text-brand-purple-light">
                ✓ {file.name} selected
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-light hover:bg-bg-light rounded-full transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-purple text-white rounded-full font-bold hover:bg-brand-purple-bright shadow-purple-glow hover:shadow-purple-glow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={uploading || !title || !genre || !description || !file}
            >
              {uploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

