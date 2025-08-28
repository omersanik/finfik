import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const supabase = CreateSupabaseClient();

  // Get enrolled course IDs
  const { data: enrolledCourses, error: enrollError } = await supabase
    .from("course_enrollments")
    .select("course_id")
    .eq("clerk_id", userId);

  if (enrollError) {
    return new Response("Failed to fetch enrollments", { status: 500 });
  }

  const enrolledCourseIds = enrolledCourses.map((e) => e.course_id);

  let courses, courseError;
  if (enrolledCourseIds.length > 0) {
    ({ data: courses, error: courseError } = await supabase
      .from("courses")
      .select("*, course_level")
      .not("id", "in", `(${enrolledCourseIds.join(",")})`));
  } else {
    ({ data: courses, error: courseError } = await supabase
      .from("courses")
      .select("*, course_level"));
  }

  if (courseError) {
    return new Response("Failed to fetch courses", { status: 500 });
  }

  return new Response(JSON.stringify(courses), { status: 200 });
}
