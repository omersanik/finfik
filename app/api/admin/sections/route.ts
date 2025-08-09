import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = CreateSupabaseClient();

    const { data: sections, error } = await supabase
      .from("course_path_sections")
      .select(`
        id,
        title,
        "order",
        created_at,
        content_blocks (
          id,
          title,
          order_index,
          created_at
        )
      `)
      .order("order");

    if (error) {
      console.error("Error fetching sections:", error);
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }

    return NextResponse.json(sections || []);
  } catch (error) {
    console.error("Error in sections API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = CreateSupabaseClient();

  try {
    const { course_path, title, description, lessons, order, slug } =
      await req.json();

    if (
      !course_path ||
      !title ||
      !description ||
      !lessons ||
      order === undefined ||
      !slug
    ) {
      return new Response("Missing required fields", { status: 400 });
    }

    let parsedLessons;
    try {
      parsedLessons =
        typeof lessons === "string" ? JSON.parse(lessons) : lessons;
    } catch (error) {
      return new Response("Invalid lessons JSON format", { status: 400 });
    }

    // Step 1: Insert the new section
    const { data: newSection, error: insertError } = await supabase
      .from("course_path_sections")
      .insert([
        {
          course_path_id: course_path,
          title,
          description,
          lessons: parsedLessons,
          order: parseInt(order),
          slug,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Get the course ID for this course_path
    const { data: pathData, error: pathError } = await supabase
      .from("course_path")
      .select("course_id")
      .eq("id", course_path)
      .single();

    if (pathError || !pathData) {
      return new Response("Failed to fetch course_id", { status: 500 });
    }

    const course_id = pathData.course_id;

    // Step 3: Get all enrolled users in this course
    const { data: enrolledUsers, error: userError } = await supabase
      .from("course_enrollments")
      .select("clerk_id")
      .eq("course_id", course_id);

    if (userError) {
      console.error("Enrollment fetch error:", userError);
      return new Response("Failed to fetch enrollments", { status: 500 });
    }

    // Step 4: Create progress records for the new section
    const newProgressEntries = enrolledUsers.map((user) => ({
      clerk_id: user.clerk_id,
      user_id: user.clerk_id, // optional — keep if used in your system
      course_path_section_id: newSection.id,
      unlocked: parseInt(order) === 0,
      completed: false,
      quiz_passed: false,
      completed_at: null,
      updated_at: new Date().toISOString(),
    }));

    if (newProgressEntries.length > 0) {
      const { error: progressError } = await supabase
        .from("course_path_section_progress")
        .insert(newProgressEntries);

      if (progressError) {
        console.error("Progress insert error:", progressError);
        return new Response("Failed to create progress records", {
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify(newSection), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
