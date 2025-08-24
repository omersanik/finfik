import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/supabase-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  console.log("[API] Course path route called with params:", params);
  
  // Await params first
  const { slug } = await params;
  
  console.log("[API] Slug:", slug);

  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    console.error("[API] Unauthorized: No userId");
    return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

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

  // 5. Fetch course_path with sections and progress using proper join syntax
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
        unlocked: progress?.unlocked || false, // FIXED: Default to false, not true!
      };
    })
    .sort((a, b) => a.order - b.order);

  // 7. Check if user has any progress for this course - if not, initialize it
  const hasAnyProgress = sortedSections.some(section => {
    const progress = (coursePath.course_path_sections || []).find(s => s.id === section.id)?.course_path_section_progress?.find(p => p.clerk_id === user.clerk_id);
    return progress !== undefined;
  });

  if (!hasAnyProgress) {
    console.log(`[API] No progress found for user ${user.clerk_id} in course ${course.id}, initializing...`);
    
    // Initialize progress entries for all sections
    const progressEntries = sortedSections.map(section => ({
      clerk_id: user.clerk_id,
      course_path_section_id: section.id,
      unlocked: section.order === 0, // Only unlock the first section
      completed: false,
      quiz_passed: false,
      completed_at: null,
      updated_at: new Date().toISOString(),
    }));

    const { error: initError } = await supabase
      .from("course_path_section_progress")
      .insert(progressEntries);

    if (initError) {
      console.error("[API] Error initializing progress:", initError);
      // Don't fail the request - just log the error
    } else {
      console.log(`[API] Progress initialized for user ${user.clerk_id} in course ${course.id}`);
      
      // Update the sections to reflect the newly created progress
      sortedSections.forEach(section => {
        if (section.order === 0) {
          section.unlocked = true; // First section is now unlocked
        }
      });
    }
  }

  return NextResponse.json({
    pathId: coursePath.id,
    pathName: coursePath.name,
    sections: sortedSections,
    sectionSlugs:
      coursePath.course_path_sections?.map((section) => section.slug) || [],
  });
}
