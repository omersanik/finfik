import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) return new Response("Unauthorized", { status: 401 });

    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("course_enrollments")
      .select(
        "courses(id, title, slug, thumbnail_url, description, course_level)"
      )
      .eq("clerk_id", userId);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(data.map((e) => e.courses)), {
      status: 200,
    });
  } catch (error) {
    console.error("Enrolled courses API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
