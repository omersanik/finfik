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

    const { title, description, order_index, section_id } = await req.json();

    // Validate required fields
    if (!title || !description || !section_id) {
      return NextResponse.json({ error: 'Title, description, and section_id are required' }, { status: 400 });
    }

    // Update content block
    const { data, error } = await supabase
      .from('content_block')
      .update({
        title,
        description,
        order_index: order_index || 0,
        section_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content block:', error);
      return NextResponse.json({ error: 'Failed to update content block' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Content block updated successfully', block: data });
  } catch (error) {
    console.error('Error in update content block:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
