import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Await params first
  const { slug } = await params;

  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    console.error("[API] Unauthorized: No userId");
    return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
  }

  const supabase = CreateSupabaseClient();

  // 2. Get user info from your DB to retrieve clerk_id and verify user exists
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("clerk_id", userId)
    .single();

  if (userError || !user) {
    console.error(`[API] User not found. userId: ${userId}, error:`, userError);
    return NextResponse.json({ error: `User not found for clerk_id: ${userId}` }, { status: 404 });
  }

  // 3. Get all courses' id and slug
  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("id, slug");

  if (courseError) {
    console.error("[API] Error fetching courses:", courseError);
    return NextResponse.json(
      { error: "Error fetching courses", details: courseError },
      { status: 500 }
    );
  }

  // 4. Find course by slug param
  const course = courses?.find((c) => c.slug === slug);
  if (!course) {
    console.error(`[API] Course not found for slug: ${slug}`);
    return NextResponse.json(
      { error: `Course not found for slug: ${slug}` },
      { status: 404 }
    );
  }

  // 5. Fetch course_path with sections and progress filtered by user
  const { data: coursePath, error: coursePathError } = await supabase
    .from("course_path")
    .select(
      `
      id,
      name,
      course_path_sections(
        id,
        title,
        order,
        description,
        slug,
        course_path_section_progress(completed, unlocked, clerk_id)
      )
    `
    )
    .eq("course_id", course.id)
    .single();

  if (coursePathError || !coursePath) {
    console.error(`[API] Course path not found for course ID: ${course.id}, error:`, coursePathError);
    return NextResponse.json(
      { error: `Course path not found for course ID: ${course.id}`, details: coursePathError },
      { status: 404 }
    );
  }

  // 6. Map and sort sections, attach user progress info if available
  const sortedSections = (coursePath.course_path_sections || [])
    .map((section) => {
      // Find progress for current user in this section
      const progress = (section.course_path_section_progress || []).find(
        (p) => p.clerk_id === user.clerk_id
      );

      return {
        id: section.id,
        title: section.title,
        order: section.order,
        description: section.description,
        slug: section.slug,
        completed: progress?.completed || false,
        unlocked: progress?.unlocked || false,
      };
    })
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({
    pathId: coursePath.id,
    pathName: coursePath.name,
    sections: sortedSections,
    sectionSlugs:
      coursePath.course_path_sections?.map((section) => section.slug) || [],
  });
}
