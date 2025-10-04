import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const notificationIds = Array.isArray(body?.notificationIds)
      ? body.notificationIds.filter((id: unknown) => typeof id === 'string')
      : [];

    if (notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'notificationIds must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
