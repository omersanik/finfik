import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// --- Types for your tables --- //
interface ContentBlock {
  id: string;
  section_id: string;
  title: string | null;
  order_index: number;
  created_at: string;
}

interface ContentItem {
  id: string;
  block_id: string;
  type: string;
  content_text: string | null;
  image_url: string | null;
  quiz_data: unknown | null;
  component_key: string | null;
  order_index: number;
  created_at: string;
  content_type: string | null;
  styling_data: unknown | null;
  math_formula: string | null;
  interactive_data: unknown | null;
  media_files: unknown | null;
  font_settings: unknown | null;
  layout_config: unknown | null;
  animation_settings: unknown | null;
}

// --- GET --- //
export async function GET(req: Request) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get section_id from query params
  const { searchParams } = new URL(req.url);
  const section_id = searchParams.get("section_id");
  if (!section_id) {
    return NextResponse.json({ error: "Missing section_id" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 3. Fetch all content_blocks for the section
  const { data: blocks, error: blocksError } = await supabase
    .from("content_block")
    .select("id, section_id, title, order_index, created_at")
    .eq("section_id", section_id)
    .order("order_index", { ascending: true });

  if (blocksError || !blocks) {
    return NextResponse.json(
      { error: "Error fetching blocks" },
      { status: 500 }
    );
  }

  // 4. For each block, fetch its content_items
  const blockIds = blocks.map((b: ContentBlock) => b.id);
  let itemsByBlock: Record<string, ContentItem[]> = {};
  if (blockIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("content-item") // fixed table name
      .select(
        "id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings"
      )
      .in("block_id", blockIds);

    if (itemsError || !items) {
      return NextResponse.json(
        { error: "Error fetching items" },
        { status: 500 }
      );
    }

    // Group items by block_id
    itemsByBlock = items.reduce<Record<string, ContentItem[]>>((acc, item) => {
      if (!acc[item.block_id]) acc[item.block_id] = [];
      acc[item.block_id].push(item as ContentItem);
      return acc;
    }, {});
  }

  // 5. Attach items to blocks
  const blocksWithItems = blocks.map((block: ContentBlock) => ({
    ...block,
    content_items: itemsByBlock[block.id] || [],
  }));

  return NextResponse.json({ blocks: blocksWithItems });
}

// --- POST --- //
export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body = await req.json();
    const { section_id, title, order_index } = body as {
      section_id: string;
      title?: string;
      order_index: number;
    };

    if (!section_id || order_index === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("content_block")
      .insert([
        {
          section_id,
          title: title || null,
          order_index,
        },
      ])
      .select()
      .single<ContentBlock>();

    if (error || !data) {
      return NextResponse.json({ error: error?.message }, { status: 500 });
    }

    return NextResponse.json({ block: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: `Internal server error ${err}` },
      { status: 500 }
    );
  }
}
