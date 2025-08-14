import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('section_id');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('content_block')
      .select('*');

    // If sectionId is provided, filter blocks for that section
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data: blocks, error } = await query.order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching content blocks:', error);
      return NextResponse.json({ error: 'Failed to fetch content blocks' }, { status: 500 });
    }

    return NextResponse.json(blocks || []);
  } catch (error) {
    console.error('Error in GET content blocks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 