import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, parentCommentId, body: commentBody } = body;

    if (!postId || !commentBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorUserId: user.id,
        parentCommentId: parentCommentId || null,
        body: commentBody,
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    // Automatically upvote the user's own comment
    await prisma.commentVote.create({
      data: {
        userId: user.id,
        commentId: comment.id,
        value: 1,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing postId parameter' },
        { status: 400 }
      );
    }

    // Find user
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const commentsWithScores = comments.map((comment) => {
      const upvotes = comment.votes.filter((v) => v.value === 1).length;
      const downvotes = comment.votes.filter((v) => v.value === -1).length;
      const score = upvotes - downvotes;
      const userVote = comment.votes.find((v) => v.userId === user!.id)?.value || 0;

      return {
        id: comment.id,
        postId: comment.postId,
        parentCommentId: comment.parentCommentId,
        body: comment.body,
        author: comment.author.username,
        createdAt: comment.createdAt,
        score,
        userVote,
      };
    });

    return NextResponse.json(commentsWithScores);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

