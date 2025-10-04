import { NextRequest, NextResponse } from 'next/server';
import { NotificationType } from '@prisma/client';
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

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorUserId: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    let parentCommentAuthorId: string | null = null;

    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: {
          id: true,
          authorUserId: true,
          postId: true,
        },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      if (parentComment.postId !== post.id) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to the same post' },
          { status: 400 }
        );
      }

      parentCommentAuthorId = parentComment.authorUserId;
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

    const recipientMap = new Map<string, NotificationType>();

    if (post.authorUserId !== user.id) {
      recipientMap.set(post.authorUserId, NotificationType.COMMENT_ON_POST);
    }

    if (parentCommentAuthorId && parentCommentAuthorId !== user.id) {
      recipientMap.set(parentCommentAuthorId, NotificationType.REPLY_TO_COMMENT);
    }

    const notificationsData = Array.from(recipientMap.entries()).map(
      ([recipientId, type]) => ({
        userId: recipientId,
        commentId: comment.id,
        postId: post.id,
        triggeredByUserId: user.id,
        type,
      })
    );

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({ data: notificationsData });
    }

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

    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

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
