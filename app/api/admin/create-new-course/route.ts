import { CreateSupabaseClient } from "@/supabase-client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = CreateSupabaseClient();

    const { title, description, slug, thumbnail_url, is_premium_course, coming_soon } =
      await req.json();

    if (!title || !description || !slug || !thumbnail_url) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Insert into courses
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          slug,
          thumbnail_url,
          is_premium_course,
          coming_soon,
        },
      ])
      .select()
      .single(); // get single inserted record

    if (courseError || !courseData) {
      return new Response(courseError?.message || "Failed to create course", {
        status: 500,
      });
    }

    // Insert into course_path using course id
    const { data: coursePathData, error: coursePathError } = await supabase
      .from("course_path")
      .insert([
        {
          course_id: courseData.id,
          name: courseData.title, // Assuming you want to use the course title as the path name
        },
      ])
      .select()
      .single();

    if (coursePathError) {
      return new Response(coursePathError.message, { status: 500 });
    }

    // Return both inserted records
    return new Response(
      JSON.stringify({ course: courseData, coursePath: coursePathData }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
