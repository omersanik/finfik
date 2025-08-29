import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Note: We do NOT put 'context' as the second argument
export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the 'id' from the URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // gets the last segment of the path
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { title, order_index, section_id } = await req.json();

    if (!title || !section_id) {
      return NextResponse.json(
        { error: "Title and section_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("content_block")
      .update({
        title,
        order_index: order_index || 0,
        section_id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating content block:", error);
      return NextResponse.json(
        { error: "Failed to update content block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Content block updated successfully",
      block: data,
    });
  } catch (error) {
    console.error("Error in update content block:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
