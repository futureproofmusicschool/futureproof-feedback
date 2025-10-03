import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadUrl } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing filename or contentType' },
        { status: 400 }
      );
    }

    // Validate audio content type
    if (!contentType.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Only audio files are allowed' },
        { status: 400 }
      );
    }

    const { uploadUrl, filePath } = await generateSignedUploadUrl(
      filename,
      contentType
    );

    return NextResponse.json({ uploadUrl, filePath });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

