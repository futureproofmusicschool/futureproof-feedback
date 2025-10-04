import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicUrl } from '@/lib/storage';
import { calculateHot, type SortOption } from '@/lib/sorting';

export async function POST(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, genre, description, filePath, mimeType, durationSeconds } = body;

    if (!title || !genre || !description || !filePath || !mimeType || durationSeconds === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate duration (< 600 seconds = 10 minutes)
    if (durationSeconds >= 600) {
      return NextResponse.json(
        { error: 'Audio duration must be less than 10 minutes' },
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

    // Get public URL
    const storageUrl = await getPublicUrl(filePath);

    // Create post
    const post = await prisma.post.create({
      data: {
        authorUserId: user.id,
        title,
        genre,
        description,
        storageUrl,
        storagePath: filePath,
        mimeType,
        durationSeconds: Math.floor(durationSeconds),
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
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
    const sort = (searchParams.get('sort') || 'hot') as SortOption;
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Find user
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
      });
    }

    // Fetch posts with vote aggregates
    const posts = await prisma.post.findMany({
      take: limit,
      skip: offset,
      orderBy: sort === 'new' ? { createdAt: 'desc' } : undefined,
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

    // Calculate scores and user's votes
    const postsWithScores = posts.map((post) => {
      const upvotes = post.votes.filter((v) => v.value === 1).length;
      const downvotes = post.votes.filter((v) => v.value === -1).length;
      const score = upvotes - downvotes;
      const userVote = post.votes.find((v) => v.userId === user!.id)?.value || 0;
      const hot = calculateHot(upvotes, downvotes, post.createdAt);

      return {
        id: post.id,
        title: post.title,
        genre: post.genre,
        description: post.description,
        storageUrl: post.storageUrl,
        mimeType: post.mimeType,
        durationSeconds: post.durationSeconds,
        author: post.author.username,
        createdAt: post.createdAt,
        score,
        hot,
        userVote,
        commentCount: post._count.comments,
      };
    });

    // Sort based on option
    if (sort === 'top') {
      postsWithScores.sort((a, b) => b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === 'hot') {
      postsWithScores.sort((a, b) => b.hot - a.hot);
    }

    return NextResponse.json(postsWithScores);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

