import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("Recent course API called for userId:", userId);

    const supabase = supabaseAdmin;

    // Query course_enrollments joined with courses to get course info
    const { data, error } = await supabase
      .from("course_enrollments")
      .select(
        `
      last_accessed,
      courses (
        id,
        title,
        slug,
        thumbnail_url,
        description,
        course_level
      )
    `
      )
      .eq("clerk_id", userId)
      .not("last_accessed", "is", null)
      .order("last_accessed", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching recent course:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    console.log("Recent course query result:", data);

    if (!data || data.length === 0) {
      // Try to get the most recently enrolled course as fallback
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("course_enrollments")
        .select(
          `
        enrolled_at,
        courses (
          id,
          title,
          slug,
          thumbnail_url,
          description,
          course_level
        )
      `
        )
        .eq("clerk_id", userId)
        .order("enrolled_at", { ascending: false })
        .limit(1);

      if (fallbackError || !fallbackData || fallbackData.length === 0) {
        console.log("No fallback course found either");
        // No recent course found
        return new Response(JSON.stringify(null), { status: 200 });
      }

      console.log("Fallback course found:", fallbackData[0]);

      // Return the course details from the most recently enrolled course
      const mostRecentEnrollment = fallbackData[0];
      return new Response(JSON.stringify(mostRecentEnrollment.courses), {
        status: 200,
      });
    }

    // Return the course details from the first (most recent) enrollment
    const mostRecentEnrollment = data[0];
    return new Response(JSON.stringify(mostRecentEnrollment.courses), {
      status: 200,
    });
  } catch (error) {
    console.error("Recent course API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
