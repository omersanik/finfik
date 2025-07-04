import { NextRequest } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const supabase = CreateSupabaseClient();
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) return new Response("Missing course slug", { status: 400 });

  // 1. Get course_id by slug
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    return new Response("Course not found", { status: 404 });
  }

  const course_id = course.id;

  // 2. Check enrollment
  const { data, error } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("clerk_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (error) return new Response(error.message, { status: 500 });

  return data
    ? new Response("Enrolled", { status: 200 })
    : new Response("Not enrolled", { status: 404 });
}
