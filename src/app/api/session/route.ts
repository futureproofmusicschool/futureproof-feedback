import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username },
  });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  });
}
