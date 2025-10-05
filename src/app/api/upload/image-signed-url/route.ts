import { NextRequest, NextResponse } from 'next/server';
import { generateSignedImageUploadUrl } from '@/lib/storage';

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
        { error: 'Missing required fields: filename, contentType' },
        { status: 400 }
      );
    }

    // Validate content type (JPG only)
    if (!['image/jpeg', 'image/jpg'].includes(contentType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Only JPG images are allowed' },
        { status: 400 }
      );
    }

    const { uploadUrl, filePath } = await generateSignedImageUploadUrl(
      filename,
      contentType
    );

    return NextResponse.json({
      uploadUrl,
      filePath,
    });
  } catch (error) {
    console.error('Error generating image upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

