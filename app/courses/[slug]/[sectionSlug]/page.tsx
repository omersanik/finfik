import SectionClient from "@/components/SectionClient";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string; sectionSlug: string }>;
}) {
  const { slug, sectionSlug } = await params;

  // Early return if sectionSlug is missing
  if (!sectionSlug || sectionSlug === "undefined" || sectionSlug === "") {
    return (
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Invalid Section Slug</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Section slug is missing or invalid: <span className="font-mono">{sectionSlug}</span></CardDescription>
          <p className="mt-2 text-muted-foreground">Course slug: <span className="font-mono">{slug}</span></p>
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>URL Format Error</AlertTitle>
            <AlertDescription>Expected URL format: <span className="font-mono">/courses/course-slug/section-slug</span></AlertDescription>
          </Alert>
        </CardContent>
      </Card>
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
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Course Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No course found with slug: <span className="font-mono">{slug}</span></CardDescription>
        </CardContent>
      </Card>
    );
  }

  // If course is premium, check if user is premium
  if (course.is_premium_course) {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_premium")
      .eq("clerk_id", userId)
      .single();
    
    if (userError || !user || !user.is_premium) {
      // User is not premium, redirect to subscription page
      redirect("/subscription");
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
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Course Path Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No course path found for course: <span className="font-mono">{slug}</span></CardDescription>
        </CardContent>
      </Card>
    );
  }

  // 3. Find the section by slug and course_path_id
  const { data: section, error: sectionError } = await supabase
    .from("course_path_sections")
    .select("id, title, order, course_path_id")
    .eq("slug", sectionSlug.trim())
    .eq("course_path_id", coursePath.id)
    .single();

  if (sectionError || !section) {
    return (
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Section Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>No section found with slug: <span className="font-mono">{sectionSlug}</span></CardDescription>
          <p className="mt-2 text-muted-foreground">In course: <span className="font-mono">{slug}</span></p>
        </CardContent>
      </Card>
    );
  }

  // 4. Fetch content blocks and items directly from Supabase
  const { data: blocks, error: blocksError } = await supabase
    .from("content_block")
    .select("id, section_id, title, order_index, created_at")
    .eq("section_id", section.id)
    .order("order_index", { ascending: true });

  let itemsByBlock: Record<string, any[]> = {};
  if (blocks && blocks.length > 0) {
    const blockIds = blocks.map((b: any) => b.id);
    const { data: items, error: itemsError } = await supabase
      .from("content_item")
      .select("id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_items, drag_drop_categories")
      .in("block_id", blockIds);
    if (!itemsError && items) {
      itemsByBlock = items.reduce((acc: any, item: any) => {
        if (!acc[item.block_id]) acc[item.block_id] = [];
        acc[item.block_id].push(item);
        return acc;
      }, {});
    }
  }

  // Attach items to blocks
  const blocksWithItems = (blocks || []).map((block: any) => ({
    ...block,
    content_items: itemsByBlock[block.id] || [],
  }));

  // Sort blocks by order_index
  const sortedBlocks = [...blocksWithItems].sort(
    (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
  );

  // Sort each block's content items by order_index
  sortedBlocks.forEach((block: any, index: number) => {
    if (block.content_items && Array.isArray(block.content_items)) {
      block.content_items.sort(
        (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
      );
    }
  });

  if (blocksError) {
    return (
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Error Loading Section Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{blocksError.message}</AlertDescription>
          </Alert>
          <p className="mt-2 text-muted-foreground">Section slug: <span className="font-mono">{sectionSlug}</span></p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SectionClient
        section={section}
        coursePathId={section.course_path_id}
        courseSlug={slug}
        blocks={sortedBlocks}
      />
    </>
  );
}
