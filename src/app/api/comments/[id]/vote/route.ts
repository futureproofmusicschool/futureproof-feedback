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

    // Check if comment exists
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (value === 0) {
      // Remove vote
      await prisma.commentVote.deleteMany({
        where: {
          userId: user.id,
          commentId: id,
        },
      });
    } else {
      // Upsert vote
      await prisma.commentVote.upsert({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId: id,
          },
        },
        create: {
          userId: user.id,
          commentId: id,
          value,
        },
        update: {
          value,
        },
      });
    }

    return NextResponse.json({ success: true, newVote: value });
  } catch (error) {
    console.error('Error voting on comment:', error);
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    );
  }
}

