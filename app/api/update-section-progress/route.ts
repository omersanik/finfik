import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("API: update-section-progress called");

    const { userId } = await auth();
    if (!userId) {
      console.log("API: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("API: Request body:", body);

    const { sectionId, completed } = body;

    if (!sectionId || typeof completed !== "boolean") {
      console.log("API: Invalid parameters:", { sectionId, completed });
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const supabase = CreateSupabaseClient();

    const { data, error } = await supabase
      .from("course_path_sections")
      .update({ completed })
      .eq("id", sectionId)
      .select();

    if (error) {
      console.error("API: Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      );
    }

    console.log("API: Success:", data);
    return NextResponse.json({
      success: true,
      data,
      message: `Section ${completed ? "completed" : "reset"}`,
    });
  } catch (error) {
    console.error("API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
