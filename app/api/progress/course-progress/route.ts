import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Get course_path for this course
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", courseId)
      .single();

    if (coursePathError || !coursePath) {
      console.error("Error fetching course path:", coursePathError);
      return NextResponse.json(
        { error: "Course path not found" },
        { status: 404 }
      );
    }

    // Get all sections for this course path
    const { data: sections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select("id, order")
      .eq("course_path_id", coursePath.id)
      .order("order");

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      return NextResponse.json({
        progress: 0,
        totalSections: 0,
        unlockedSections: 0,
      });
    }

    const totalSections = sections.length;

    // Get user's progress for all sections in this course
    const { data: progress, error: progressError } = await supabase
      .from("course_path_section_progress")
      .select("course_path_section_id, unlocked, completed")
      .eq("clerk_id", userId)
      .in(
        "course_path_section_id",
        sections.map((s) => s.id)
      );

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Count completed sections instead of unlocked sections
    const completedSections = progress?.filter((p) => p.completed).length || 0;

    // Calculate progress: (completed sections / total sections) * 100
    const progressPercentage = Math.round(
      (completedSections / totalSections) * 100
    );

    return NextResponse.json({
      progress: progressPercentage,
      totalSections,
      completedSections,
    });
  } catch (error) {
    console.error("Error calculating course progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
