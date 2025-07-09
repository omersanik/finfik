import { CreateSupabaseClient } from "@/supabase-client";

export async function GET() {
  const supabase = CreateSupabaseClient();

  const { data: premiumCourse, error: premiumCourseError } = await supabase
    .from("courses")
    .select("*")
    .eq("is_premium_course", true);

  if (premiumCourseError) {
    return new Response(JSON.stringify({ error: premiumCourseError.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ data: premiumCourse }), {
    status: 200,
  });
}
