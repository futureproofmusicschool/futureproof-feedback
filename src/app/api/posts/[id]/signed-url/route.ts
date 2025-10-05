import { NextRequest, NextResponse } from 'next/server';
import { generateSignedDownloadUrl } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    // Get the post to retrieve the storage path
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { storagePath: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Generate signed URL that expires in 1 hour
    const signedUrl = await generateSignedDownloadUrl(post.storagePath, 3600);

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}

