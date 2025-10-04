import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? 'unread';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(status === 'unread' ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            body: true,
          },
        },
        actor: {
          select: {
            username: true,
          },
        },
      },
      take: status === 'unread' ? 50 : 200,
    });

    return NextResponse.json(
      notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        createdAt: notification.createdAt,
        isRead: notification.isRead,
        postId: notification.post.id,
        postTitle: notification.post.title,
        commentId: notification.comment.id,
        commentSnippet: notification.comment.body.slice(0, 140),
        actor: notification.actor.username,
      }))
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
