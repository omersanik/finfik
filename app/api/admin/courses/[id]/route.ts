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

    const { name, description, slug, thumbnail_url, is_premium } = await req.json();

    // Validate required fields
    if (!name || !description || !slug) {
      return NextResponse.json({ error: 'Name, description, and slug are required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Update course
    const { data, error } = await supabase
      .from('courses')
      .update({
        name,
        description,
        slug,
        thumbnail_url: thumbnail_url || null,
        is_premium: is_premium || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating course:', error);
      return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Course updated successfully', course: data });
  } catch (error) {
    console.error('Error in update course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
