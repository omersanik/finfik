import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const { id } = params;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { title, order_index, section_id } = await req.json();

    if (!title || !section_id) {
      return NextResponse.json(
        { error: "Title and section_id are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

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
