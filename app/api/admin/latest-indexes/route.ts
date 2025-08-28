import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coursePathId = searchParams.get("course_path_id");
    const sectionId = searchParams.get("section_id");
    const blockId = searchParams.get("block_id");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const result: Record<string, unknown> = {};

    // Get latest section order for a course path
    if (coursePathId) {
      const { data: latestSection, error: sectionError } = await supabase
        .from("course_path_sections")
        .select("order")
        .eq("course_path_id", coursePathId)
        .order("order", { ascending: false })
        .limit(1)
        .single();

      if (!sectionError && latestSection) {
        result.latestSectionOrder = latestSection.order;
        result.nextSectionOrder = latestSection.order + 1;
      } else {
        result.latestSectionOrder = 0;
        result.nextSectionOrder = 0;
      }
    }

    // Get latest content block order_index for a section
    if (sectionId) {
      const { data: latestBlock, error: blockError } = await supabase
        .from("content_block")
        .select("order_index")
        .eq("section_id", sectionId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      if (!blockError && latestBlock) {
        result.latestBlockOrder = latestBlock.order_index;
        result.nextBlockOrder = latestBlock.order_index + 1;
      } else {
        result.latestBlockOrder = 0;
        result.nextBlockOrder = 0;
      }
    }

    // Get latest content item order_index for a block
    if (blockId) {
      const { data: latestItem, error: itemError } = await supabase
        .from("content_item")
        .select("order_index")
        .eq("block_id", blockId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      if (!itemError && latestItem) {
        result.latestItemOrder = latestItem.order_index;
        result.nextItemOrder = latestItem.order_index + 1;
      } else {
        result.latestItemOrder = 0;
        result.nextItemOrder = 0;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching latest indexes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
