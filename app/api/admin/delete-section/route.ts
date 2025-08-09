import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionId, adminPassword } = await request.json();
    if (!sectionId) {
      return NextResponse.json({ error: "Section ID is required" }, { status: 400 });
    }

    // Verify admin password
    if (adminPassword !== "yavheheAa1@") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    const supabase = CreateSupabaseClient();

    // First, get all content blocks in this section
    const { data: contentBlocks, error: blocksError } = await supabase
      .from("content_block")
      .select("id")
      .eq("section_id", sectionId);

    if (blocksError) {
      console.error("Error fetching content blocks:", blocksError);
      return NextResponse.json({ error: "Failed to fetch content blocks" }, { status: 500 });
    }

    // Delete all content items in all blocks of this section
    if (contentBlocks && contentBlocks.length > 0) {
      const blockIds = contentBlocks.map(block => block.id);
      
      const { error: contentItemsError } = await supabase
        .from("content_item")
        .delete()
        .in("block_id", blockIds);

      if (contentItemsError) {
        console.error("Error deleting content items:", contentItemsError);
        return NextResponse.json({ error: "Failed to delete content items" }, { status: 500 });
      }

      // Delete all content blocks
      const { error: deleteBlocksError } = await supabase
        .from("content_block")
        .delete()
        .eq("section_id", sectionId);

      if (deleteBlocksError) {
        console.error("Error deleting content blocks:", deleteBlocksError);
        return NextResponse.json({ error: "Failed to delete content blocks" }, { status: 500 });
      }
    }

    // Delete the section
    const { error: sectionError } = await supabase
      .from("course_path_sections")
      .delete()
      .eq("id", sectionId);

    if (sectionError) {
      console.error("Error deleting section:", sectionError);
      return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Section and all its content deleted successfully" });
  } catch (error) {
    console.error("Error in delete section:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
