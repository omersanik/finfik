import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export const getAllCourses = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching courses:", error.message);
  }

  console.log("Fetched courses:", data);
  return data;
};

export const fetchCourse = async (slug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const supabase = CreateSupabaseClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course || courseError) {
    throw new Error("Course not found!");
  }
  return course;
};

export const fetchCoursePath = async (slug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const supabase = CreateSupabaseClient();

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("clerk_id")
    .eq("clerk_id", userId)
    .single();
  if (userError || !user) {
    console.error("❌ User not found:", userError?.message);
    throw new Error("User not found!");
  }
  console.log("👤 User ID:", user);
  console.log("📦 Slug received:", slug);

  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("id, slug");

  if (courseError) {
    console.error("Error fetching courses:", courseError.message);
    throw new Error("Error fetching courses.");
  }

  const course = courses?.find((c) => c.slug === slug);

  if (!course) {
    console.error("❌ Course not found for slug:", slug);
    throw new Error(`Course not found! Slug: ${slug}`);
  }

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
    console.error("❌ Course path fetch error:", coursePathError?.message);
    throw new Error("Course path not found!");
  }

  const sortedSections = coursePath.course_path_sections
    .map((section) => {
      const progress = section.course_path_section_progress?.find(
        (p) => p.clerk_id === user.clerk_id
      );
      return {
        ...section,
        completed: progress?.completed || false,
        unlocked: progress?.unlocked || false,
      };
    })
    .sort((a, b) => a.order - b.order);

  return {
    pathId: coursePath.id,
    pathName: coursePath.name,
    sections: sortedSections, //
    sectionSlug: coursePath.course_path_sections.map((section) => section.slug), // Add section slugs
  };
};
