import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch all content blocks
    const { data: blocks, error } = await supabase
      .from('content_block')
      .select('*')
      .order('created_at', { ascending: false });

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