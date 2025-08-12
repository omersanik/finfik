import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const coursePathId = searchParams.get('course_path_id');
    const allSections = searchParams.get('all');

    // If requesting all sections for admin edit page
    if (allSections === 'true') {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: sections, error } = await supabase
        .from('sections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all sections:', error);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
      }

      return NextResponse.json(sections || []);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (coursePathId) {
      // Direct course_path_id provided
      console.log("Looking for sections with course_path_id:", coursePathId);
      
      const { data: sections, error: sectionsError } = await supabase
        .from("course_path_sections")
        .select(`
          id,
          title,
          "order",
          created_at,
          content_block (
            id,
            title,
            order_index,
            created_at
          )
        `)
        .eq("course_path_id", coursePathId)
        .order("order");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
      }

      console.log("Sections found:", sections?.length || 0);
      return NextResponse.json(sections || []);
    } else if (courseId) {
      console.log("Looking for course path with courseId:", courseId);
      
      // First, let's check if the course exists
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        console.error("Course not found:", courseId, "Error:", courseError);
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }

      console.log("Found course:", course.title);

      // First get the course_path_id for this course
      const { data: coursePath, error: coursePathError } = await supabase
        .from("course_path")
        .select("id, name")
        .eq("course_id", courseId)
        .single();

      if (coursePathError || !coursePath) {
        console.error("Course path not found for courseId:", courseId, "Error:", coursePathError);
        return NextResponse.json({ error: "Course path not found" }, { status: 404 });
      }

      console.log("Found course path:", coursePath.id, "name:", coursePath.name);

      // Now fetch sections for this course path
      const { data: sections, error: sectionsError } = await supabase
        .from("course_path_sections")
        .select(`
          id,
          title,
          "order",
          created_at,
          content_block (
            id,
            title,
            order_index,
            created_at
          )
        `)
        .eq("course_path_id", coursePath.id)
        .order("order");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
      }

      console.log("Sections found:", sections?.length || 0);
      return NextResponse.json(sections || []);
    } else {
      // If no courseId, return all sections (for debugging)
      console.log("No courseId provided, returning all sections");
      
      const { data: sections, error } = await supabase
        .from("course_path_sections")
        .select(`
          id,
          title,
          "order",
          created_at,
          course_path_id,
          content_block (
            id,
            title,
            order_index,
            created_at
          )
        `)
        .order("order");

      if (error) {
        console.error("Error fetching all sections:", error);
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
      }

      console.log("All sections found:", sections?.length || 0);
      return NextResponse.json(sections || []);
    }
  } catch (error) {
    console.error("Error in sections API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
