import SectionClient from "@/components/SectionClient";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string; sectionSlug: string }>;
}) {
  const { slug, sectionSlug } = await params;

  // Early return if sectionSlug is missing
  if (!sectionSlug || sectionSlug === "undefined" || sectionSlug === "") {
    return (
      <div>
        <h2>Invalid Section Slug</h2>
        <p>Section slug is missing or invalid: &quot;{sectionSlug}&quot;</p>
        <p>Course slug: &quot;{slug}&quot;</p>
        <p>Please check the URL and try again.</p>
        <p>Expected URL format: /courses/course-slug/section-slug</p>
      </div>
    );
  }

  // Get userId from Clerk
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = CreateSupabaseClient();

  // Get course info (including is_premium_course)
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, is_premium_course")
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

  // If course is premium, check if user is premium
  let debugInfo = null;
  if (course.is_premium_course) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_premium")
      .eq("clerk_id", userId)
      .single();
    if (userError || !user || !user.is_premium) {
      debugInfo = (
        <div style={{ background: '#fffbe6', color: '#b45309', padding: 16, borderRadius: 8, margin: 16 }}>
          <h2>DEBUG: Premium Access Restriction</h2>
          <p><b>course.is_premium_course:</b> {String(course.is_premium_course)}</p>
          <p><b>userId (clerk_id):</b> {userId}</p>
          <p><b>user:</b> {user ? JSON.stringify(user) : 'null'}</p>
          <p><b>userError:</b> {userError ? userError.message : 'none'}</p>
          <p><b>Expected:</b> If you see this, you should be redirected to /subscription. If not, check your Supabase users table for a row with this clerk_id and is_premium=false.</p>
        </div>
      );
      // Comment out the redirect for debugging
      // redirect("/subscription");
    }
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

  // 4. Fetch content blocks and items directly from Supabase
  const { data: blocks, error: blocksError } = await supabase
    .from("content_block")
    .select("id, section_id, title, order_index, created_at, content_items(id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at)")
    .eq("section_id", section.id)
    .order("order_index", { ascending: true });

  if (blocksError) {
    return (
      <div>
        <h2>Error Loading Section Content</h2>
        <p>Error: {blocksError.message}</p>
        <p>Section slug: {sectionSlug}</p>
      </div>
    );
  }

  // Sort blocks by order_index
  const sortedBlocks = [...(blocks || [])].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  // Sort each block's content items by order_index
  sortedBlocks.forEach((block, index) => {
    if (block.content_items && Array.isArray(block.content_items)) {
      block.content_items.sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0)
      );
    }
  });

  return (
    <>
      {debugInfo}
      <SectionClient
        section={section}
        coursePathId={section.course_path_id}
        courseSlug={slug}
        blocks={sortedBlocks}
      />
    </>
  );
}
