import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSignedDownloadUrl, getPublicImageUrl } from '@/lib/storage';
import { calculateHot, type SortOption } from '@/lib/sorting';
import { sendNewTrackWebhook } from '@/lib/webhook';

export async function POST(request: NextRequest) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, genre, description, filePath, coverImagePath, mimeType, durationSeconds } = body;

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

    // Find or create user without race conditions
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

    // Generate cover image URL if provided
    let coverImageUrl: string | undefined;
    if (coverImagePath) {
      coverImageUrl = await getPublicImageUrl(coverImagePath);
    }

    // Create post (we'll generate signed URLs on-demand for security)
    const post = await prisma.post.create({
      data: {
        authorUserId: user.id,
        title,
        genre,
        description,
        storageUrl: '', // Will be generated on-demand with signed URLs
        storagePath: filePath,
        coverImagePath: coverImagePath || null,
        coverImageUrl: coverImageUrl || null,
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

    // Automatically upvote the user's own post
    await prisma.postVote.create({
      data: {
        userId: user.id,
        postId: post.id,
        value: 1,
      },
    });

    // Send webhook to Zapier for Discord notification
    // This runs asynchronously and won't block the response
    sendNewTrackWebhook({
      title: post.title,
      username: username,
      genre: post.genre,
      postId: post.id,
    }).catch(err => console.error('Webhook error:', err));

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

    // Find or create user without race conditions
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username },
    });

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

    // Calculate scores and user's votes, and generate signed URLs
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const upvotes = post.votes.filter((v) => v.value === 1).length;
        const downvotes = post.votes.filter((v) => v.value === -1).length;
        const score = upvotes - downvotes;
        const userVote = post.votes.find((v) => v.userId === user!.id)?.value || 0;
        const hot = calculateHot(upvotes, downvotes, post.createdAt);

        // Generate signed URL that expires in 1 hour
        const signedUrl = await generateSignedDownloadUrl(post.storagePath, 3600);

        return {
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
          hot,
          userVote,
          commentCount: post._count.comments,
        };
      })
    );

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
