import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');

    const supabase = CreateSupabaseClient();

    let query = supabase
      .from("content_block")
      .select(`
        id,
        title,
        section_id,
        order_index,
        created_at,
        content_items (
          id,
          content_text,
          type,
          created_at
        )
      `);

    // If sectionId is provided, filter blocks for that section
    if (sectionId) {
      query = query.eq("section_id", sectionId);
    }

    const { data: contentBlocks, error } = await query.order("order_index");

    if (error) {
      console.error("Error fetching content blocks:", error);
      return NextResponse.json({ error: "Failed to fetch content blocks" }, { status: 500 });
    }

    return NextResponse.json(contentBlocks || []);
  } catch (error) {
    console.error("Error in content blocks API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
