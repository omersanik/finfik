import { supabaseAdmin } from "@/supabase-client";

export async function GET() {
  try {
    const supabase = supabaseAdmin;

    const { data: premiumCourse, error: premiumCourseError } = await supabase
      .from("courses")
      .select("*")
      .eq("is_premium_course", true);

    if (premiumCourseError) {
      return new Response(
        JSON.stringify({ error: premiumCourseError.message }),
        {
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify({ data: premiumCourse }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching premium courses:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
