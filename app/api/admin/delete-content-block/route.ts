import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentBlockId, adminPassword } = await request.json();
    if (!contentBlockId) {
      return NextResponse.json({ error: "Content block ID is required" }, { status: 400 });
    }

    // Verify admin password
    if (adminPassword !== "yavheheAa1@") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    const supabase = CreateSupabaseClient();

    // First, delete all content items in this block
    const { error: contentItemsError } = await supabase
      .from("content_item")
      .delete()
      .eq("block_id", contentBlockId);

    if (contentItemsError) {
      console.error("Error deleting content items:", contentItemsError);
      return NextResponse.json({ error: "Failed to delete content items" }, { status: 500 });
    }

    // Then delete the content block
    const { error: blockError } = await supabase
      .from("content_block")
      .delete()
      .eq("id", contentBlockId);

    if (blockError) {
      console.error("Error deleting content block:", blockError);
      return NextResponse.json({ error: "Failed to delete content block" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content block and all its items deleted successfully" });
  } catch (error) {
    console.error("Error in delete content block:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
