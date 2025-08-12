import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is admin using Clerk
    const user = await clerkClient.users.getUser(userId);
    const role = user?.publicMetadata?.role;
    
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { title, description, slug, lessons, order, course_path } = await req.json();

    // Validate required fields
    if (!title || !description || !slug || !course_path) {
      return NextResponse.json({ error: 'Title, description, slug, and course_path are required' }, { status: 400 });
    }

    // Update section
    const { data, error } = await supabase
      .from('sections')
      .update({
        title,
        description,
        slug,
        lessons: lessons || 0,
        order: order || 0,
        course_path,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Section updated successfully', section: data });
  } catch (error) {
    console.error('Error in update section:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
