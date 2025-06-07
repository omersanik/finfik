import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("API: unlock-next-section called");

    const { userId } = await auth();
    if (!userId) {
      console.log("API: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("API: Request body:", body);

    const { courseId, currentSectionOrder } = body;

    if (!courseId || typeof currentSectionOrder !== "number") {
      console.log("API: Invalid parameters:", {
        courseId,
        currentSectionOrder,
      });
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const supabase = CreateSupabaseClient();

    // Get the course path for this course
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", courseId)
      .single();

    if (coursePathError || !coursePath) {
      console.error("API: Course path error:", coursePathError);
      return NextResponse.json(
        { error: "Course path not found" },
        { status: 404 }
      );
    }

    // Find and unlock the next section
    const { data, error } = await supabase
      .from("course_path_sections")
      .update({ unlocked: true })
      .eq("course_path_id", coursePath.id)
      .eq("order", currentSectionOrder + 1)
      .select();

    if (error) {
      console.error("API: Unlock error:", error);
      return NextResponse.json(
        { error: "Failed to unlock next section" },
        { status: 500 }
      );
    }

    console.log("API: Unlock success:", data);
    return NextResponse.json({
      success: true,
      data,
      message:
        data && data.length > 0
          ? "Next section unlocked"
          : "No next section to unlock",
    });
  } catch (error) {
    console.error("API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
