import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSignedDownloadUrl } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        votes: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const upvotes = post.votes.filter((v) => v.value === 1).length;
    const downvotes = post.votes.filter((v) => v.value === -1).length;
    const score = upvotes - downvotes;
    const userVote = post.votes.find((v) => v.userId === user.id)?.value || 0;

    // Generate signed URL that expires in 1 hour
    const signedUrl = await generateSignedDownloadUrl(post.storagePath, 3600);

    return NextResponse.json({
      id: post.id,
      title: post.title,
      genre: post.genre,
      description: post.description,
      storageUrl: signedUrl, // Use signed URL instead of public URL
      coverImageUrl: post.coverImageUrl,
      mimeType: post.mimeType,
      durationSeconds: post.durationSeconds,
      author: post.author.username,
      createdAt: post.createdAt,
      score,
      userVote,
      commentCount: post._count.comments,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
