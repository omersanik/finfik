import SectionClient from "@/components/SectionClient";
import { CreateSupabaseClient } from "@/supabase-client";
import { cookies } from "next/headers";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string; sectionSlug: string }>;
}) {
  const { slug, sectionSlug } = await params;

  // Early return if sectionSlug is missing
  if (
    !sectionSlug ||
    sectionSlug === "undefined" ||
    sectionSlug === ""
  ) {
    return (
      <div>
        <h2>Invalid Section Slug</h2>
        <p>Section slug is missing or invalid: "{sectionSlug}"</p>
        <p>Course slug: "{slug}"</p>
        <p>Please check the URL and try again.</p>
        <p>Expected URL format: /courses/course-slug/section-slug</p>
      </div>
    );
  }

  const supabase = CreateSupabaseClient();

  // 1. Get the course by slug to get the course ID
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    return (
      <div>
        <h2>Course Not Found</h2>
        <p>No course found with slug: {slug}</p>
      </div>
    );
  }

  // 2. Get the course_path by course_id
  const { data: coursePath, error: coursePathError } = await supabase
    .from("course_path")
    .select("id")
    .eq("course_id", course.id)
    .single();

  if (coursePathError || !coursePath) {
    return (
      <div>
        <h2>Course Path Not Found</h2>
        <p>No course path found for course: {slug}</p>
      </div>
    );
  }

  // 3. Find the section by slug and course_path_id
  console.log("Querying section with slug:", sectionSlug, "and course_path_id:", coursePath.id);
  const { data: section, error: sectionError } = await supabase
    .from("course_path_sections")
    .select("id, title, order, course_path_id")
    .eq("slug", sectionSlug)
    .eq("course_path_id", coursePath.id)
    .single();

  if (sectionError || !section) {
    return (
      <div>
        <h2>Section Not Found</h2>
        <p>No section found with slug: {sectionSlug}</p>
        <p>In course: {slug}</p>
      </div>
    );
  }

  // 4. Fetch content blocks and items from the new API route, forwarding cookies for auth
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  const apiUrl = `${baseUrl}/api/courses/${slug}/blocks?section_id=${section.id}`;

  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }: { name: string; value: string }) => `${name}=${value}`)
    .join("; ");

  const blocksRes = await fetch(apiUrl, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });
  if (!blocksRes.ok) {
    return (
      <div>
        <h2>Error Loading Section Content</h2>
        <p>Error: {blocksRes.statusText}</p>
        <p>Section slug: {sectionSlug}</p>
      </div>
    );
  }
  const { blocks } = await blocksRes.json();

  console.log("Section loaded successfully:", section.title);
  console.log("Content blocks found:", blocks.length);

  // Sort blocks by order_index
  const sortedBlocks = [...blocks].sort(
    (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
  );

  // Sort each block's content items by order_index
  sortedBlocks.forEach((block: any, index: number) => {
    if (block.content_items && Array.isArray(block.content_items)) {
      block.content_items.sort(
        (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
      );
      console.log(`Block ${index} content items:`, block.content_items.length);
    }
  });

  return (
    <SectionClient
      section={section}
      coursePathId={section.course_path_id}
      courseSlug={slug}
      blocks={sortedBlocks}
    />
  );
}
