import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = CreateSupabaseClient();

    const { data: contentBlocks, error } = await supabase
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
      `)
      .order("order_index");

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
