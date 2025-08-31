import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Test the exact query for our specific item
  const itemId = "e026f3ed-ee99-42a1-93c5-542516b022fa";

  const { data: item, error } = await supabase
    .from("content_item")
    .select(
      "id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_categories, drag_drop_items"
    )
    .eq("id", itemId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    item,
    hasCategories: !!item.drag_drop_categories,
    hasItems: !!item.drag_drop_items,
    categoriesLength: item.drag_drop_categories?.length,
    itemsLength: item.drag_drop_items?.length,
  });
}
