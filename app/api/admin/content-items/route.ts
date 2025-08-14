import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body = await req.json();
    
    // Debug logging
    console.log("Content item POST request body:", body);
    
    const {
      block_id,
      type,
      content_text,
      image_url,
      quiz_data,
      component_key,
      order_index,
      quiz_question,
      content_type,
      styling_data,
      math_formula,
      interactive_data,
      media_files,
      font_settings,
      layout_config,
      animation_settings,
      drag_drop_title,
      drag_drop_instructions,
      drag_drop_items,
      drag_drop_categories,
    } = body;
    
    console.log("Type being inserted:", type);
    console.log("Drag-drop data being inserted:", {
      drag_drop_title,
      drag_drop_instructions,
      drag_drop_items,
      drag_drop_categories
    });
    
    // Handle math formula properly
    let finalMathFormula = math_formula;
    let finalContentText = content_text;
    
    // For math type, use the math_formula field directly and set content_text to null
    if (type === 'math') {
      finalMathFormula = math_formula || '';
      finalContentText = null; // Don't store content_text for math items
      console.log("Math item - using math_formula:", finalMathFormula);
    } else if (content_text && content_text.includes('class="math-formula"')) {
      // Check if this is inline math (part of text content) or block math
      if (content_text.includes('class="math-formula inline"')) {
        // Keep inline math formulas in content_text - they're part of the text
        finalContentText = content_text;
        console.log("Keeping inline math in content_text:", content_text);
      } else {
        // Legacy: extract block math formula from content_text for non-math items
        console.log("Processing block math content in text:", content_text);
        const mathFormulaMatch = content_text.match(/data-formula="([^"]+)"/);
        if (mathFormulaMatch) {
          finalMathFormula = mathFormulaMatch[1];
          console.log("Extracted math formula:", finalMathFormula);
          finalContentText = content_text.replace(/<span class="math-formula"[^>]*>.*?<\/span>/g, '');
          console.log("Cleaned content text:", finalContentText);
        }
      }
    }
    
    const { data, error } = await supabase
      .from("content_item")
      .insert([
        {
          block_id: block_id || null,
          type: type || null,
          content_text: finalContentText || null,
          image_url: image_url || null,
          quiz_data: quiz_data || null,
          component_key: component_key || null,
          order_index: order_index ?? null,
          quiz_question: quiz_question || null,
          content_type: content_type || 'text',
          styling_data: styling_data || null,
          math_formula: finalMathFormula || null,
          interactive_data: interactive_data || null,
          media_files: media_files || null,
          font_settings: font_settings || null,
          layout_config: layout_config || null,
          animation_settings: animation_settings || null,
          drag_drop_title: drag_drop_title || null,
          drag_drop_instructions: drag_drop_instructions || null,
          drag_drop_items: drag_drop_items || null,
          drag_drop_categories: drag_drop_categories || null,
        },
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Exception in POST:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('content_item')
      .select('*');

    // If blockId is provided, filter content items for that block
    if (blockId) {
      query = query.eq('block_id', blockId);
    }

    const { data: items, error } = await query.order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching content items:', error);
      return NextResponse.json({ error: 'Failed to fetch content items' }, { status: 500 });
    }

    return NextResponse.json(items || []);
  } catch (error) {
    console.error('Error in GET content items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 