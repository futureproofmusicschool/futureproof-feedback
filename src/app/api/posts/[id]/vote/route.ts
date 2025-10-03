import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { value } = body;

    if (![−1, 0, 1].includes(value)) {
      return NextResponse.json(
        { error: 'Vote value must be -1, 0, or 1' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (value === 0) {
      // Remove vote
      await prisma.postVote.deleteMany({
        where: {
          userId: user.id,
          postId: id,
        },
      });
    } else {
      // Upsert vote
      await prisma.postVote.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: id,
          },
        },
        create: {
          userId: user.id,
          postId: id,
          value,
        },
        update: {
          value,
        },
      });
    }

    // Update cached score
    const votes = await prisma.postVote.findMany({ where: { postId: id } });
    const score = votes.reduce((sum, v) => sum + v.value, 0);
    await prisma.post.update({
      where: { id },
      data: { scoreCached: score },
    });

    return NextResponse.json({ success: true, newVote: value });
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}

