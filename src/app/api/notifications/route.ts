import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? 'unread';

    console.log('🔍 Fetching notifications for user:', {
      userId: user.id,
      username: username,
      status: status,
    });

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

    console.log('📬 Found notifications:', {
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        userId: n.userId,
        triggeredBy: n.triggeredByUserId,
        isRead: n.isRead,
        createdAt: n.createdAt,
        hasPost: !!n.post,
        hasComment: !!n.comment,
        hasActor: !!n.actor,
      })),
    });

    // Filter out any notifications with missing relations and log them
    const validNotifications = notifications.filter(n => {
      const isValid = n.post && n.comment && n.actor;
      if (!isValid) {
        console.error('⚠️ Invalid notification found:', {
          id: n.id,
          missingPost: !n.post,
          missingComment: !n.comment,
          missingActor: !n.actor,
        });
      }
      return isValid;
    });

    console.log('✅ Valid notifications:', validNotifications.length);

    return NextResponse.json(
      validNotifications.map((notification) => ({
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
