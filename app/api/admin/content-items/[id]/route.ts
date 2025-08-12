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

    const {
      type,
      content_text,
      order_index,
      block_id,
      section_id,
      course_id,
      image_url,
      quiz_data,
      quiz_question,
      math_formula,
      drag_drop_title,
      drag_drop_instructions,
      drag_drop_items,
      drag_drop_categories
    } = await req.json();

    // Validate required fields
    if (!type || !block_id || !section_id || !course_id) {
      return NextResponse.json({ error: 'Type, block_id, section_id, and course_id are required' }, { status: 400 });
    }

    // Update content item
    const { data, error } = await supabase
      .from('content_item')
      .update({
        type,
        content_text: content_text || null,
        order_index: order_index || 0,
        block_id,
        section_id,
        course_id,
        image_url: image_url || null,
        quiz_data: quiz_data || null,
        quiz_question: quiz_question || null,
        math_formula: math_formula || null,
        drag_drop_title: drag_drop_title || null,
        drag_drop_instructions: drag_drop_instructions || null,
        drag_drop_items: drag_drop_items || null,
        drag_drop_categories: drag_drop_categories || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content item:', error);
      return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Content item updated successfully', item: data });
  } catch (error) {
    console.error('Error in update content item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
