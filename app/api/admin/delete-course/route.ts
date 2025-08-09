import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, adminPassword } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    // Verify admin password
    if (adminPassword !== "yavheheAa1@") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    const supabase = CreateSupabaseClient();

    // Get course path ID
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", courseId)
      .single();

    if (coursePathError) {
      console.error("Error fetching course path:", coursePathError);
      return NextResponse.json({ error: "Failed to fetch course path" }, { status: 500 });
    }

    // Get all sections in this course
    const { data: sections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select("id")
      .eq("course_path_id", coursePath.id);

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }

    // Delete all content items, blocks, and sections
    if (sections && sections.length > 0) {
      const sectionIds = sections.map(section => section.id);

      // Get all content blocks in all sections
      const { data: contentBlocks, error: blocksError } = await supabase
        .from("content_block")
        .select("id")
        .in("section_id", sectionIds);

      if (blocksError) {
        console.error("Error fetching content blocks:", blocksError);
        return NextResponse.json({ error: "Failed to fetch content blocks" }, { status: 500 });
      }

      // Delete all content items
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
          .in("section_id", sectionIds);

        if (deleteBlocksError) {
          console.error("Error deleting content blocks:", deleteBlocksError);
          return NextResponse.json({ error: "Failed to delete content blocks" }, { status: 500 });
        }
      }

      // Delete all sections
      const { error: deleteSectionsError } = await supabase
        .from("course_path_sections")
        .delete()
        .eq("course_path_id", coursePath.id);

      if (deleteSectionsError) {
        console.error("Error deleting sections:", deleteSectionsError);
        return NextResponse.json({ error: "Failed to delete sections" }, { status: 500 });
      }
    }

    // Delete course path
    const { error: deleteCoursePathError } = await supabase
      .from("course_path")
      .delete()
      .eq("id", coursePath.id);

    if (deleteCoursePathError) {
      console.error("Error deleting course path:", deleteCoursePathError);
      return NextResponse.json({ error: "Failed to delete course path" }, { status: 500 });
    }

    // Delete the course
    const { error: deleteCourseError } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (deleteCourseError) {
      console.error("Error deleting course:", deleteCourseError);
      return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Course and all its content deleted successfully" });
  } catch (error) {
    console.error("Error in delete course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
