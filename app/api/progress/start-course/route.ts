import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { course_id } = await req.json();
    if (!course_id) {
      return new Response("Missing course_id", { status: 400 });
    }

    // 1. Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("clerk_id", userId)
      .eq("course_id", course_id)
      .maybeSingle();

    if (checkError) return new Response(checkError.message, { status: 500 });

    // 2. If not enrolled, enroll
    if (!existingEnrollment) {
      const { error: enrollError } = await supabase
        .from("course_enrollments")
        .insert([
          {
            clerk_id: userId,
            course_id,
            enrolled_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
          },
        ]);

      if (enrollError) {
        return new Response(enrollError.message, { status: 500 });
      }
    } else {
      // Update last_accessed for existing enrollment
      const { error: updateError } = await supabase
        .from("course_enrollments")
        .update({ last_accessed: new Date().toISOString() })
        .eq("clerk_id", userId)
        .eq("course_id", course_id);

      if (updateError) {
        return new Response(updateError.message, { status: 500 });
      }
    }

    // 3. Fetch course_path ID
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", course_id)
      .single();

    if (coursePathError || !coursePath) {
      return new Response("Course path not found", { status: 404 });
    }

    // 4. Fetch all sections of the course
    const { data: sections, error: sectionError } = await supabase
      .from("course_path_sections")
      .select("id, order")
      .eq("course_path_id", coursePath.id);

    if (sectionError || !sections) {
      return new Response("No sections found for course path", { status: 500 });
    }

    // 5. Check which progress entries already exist
    const { data: existingProgress, error: progressCheckError } = await supabase
      .from("course_path_section_progress")
      .select("course_path_section_id")
      .eq("clerk_id", userId);

    if (progressCheckError) {
      return new Response(progressCheckError.message, { status: 500 });
    }

    const alreadyInsertedIds = new Set(
      existingProgress.map((p) => p.course_path_section_id)
    );

    const entriesToInsert = sections
      .filter((section) => !alreadyInsertedIds.has(section.id))
      .map((section) => ({
        user_id: userId, // optional if you're using `clerk_id` only
        clerk_id: userId,
        course_path_section_id: section.id,
        unlocked: section.order === 0, // unlock only the first
        completed: false,
        quiz_passed: false,
        completed_at: null,
        updated_at: new Date().toISOString(),
      }));

    if (entriesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("course_path_section_progress")
        .insert(entriesToInsert);

      if (insertError) {
        return new Response(insertError.message, { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Start course API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
