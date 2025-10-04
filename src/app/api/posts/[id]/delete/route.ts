import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const username = request.headers.get('x-username');

  if (!username) {
    return NextResponse.json({ error: 'Missing x-username header' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if the user is the author
    if (post.authorUserId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete the audio file from storage
    const { error: storageError } = await supabase.storage
      .from('audio')
      .remove([post.storagePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with post deletion even if file deletion fails
    }

    // Delete the post (cascades to votes and comments)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

