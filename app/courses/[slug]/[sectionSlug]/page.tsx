import SectionClient from "@/components/SectionClient";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Use the exact interfaces from SectionClient but with better typing
interface ContentItem {
  id: string;
  block_id: string;
  type:
    | "text"
    | "image"
    | "quiz"
    | "animation"
    | "calculator"
    | "math"
    | "chart";
  content_text?: string;
  image_url?: string;
  quiz_data?: unknown; // Changed from any to unknown
  component_key?: string;
  order_index: number;
  created_at: string;
}

interface Block {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}

// Database types (what Supabase returns)
interface DatabaseContentItem {
  id: string;
  block_id: string;
  type: string;
  content_text: string | null;
  image_url: string | null;
  quiz_data: unknown; // Changed from any to unknown
  component_key: string | null;
  order_index: number;
  created_at: string;
  content_type: string | null;
  styling_data: unknown; // Changed from any to unknown
  math_formula: string | null;
  interactive_data: unknown; // Changed from any to unknown
  media_files: unknown; // Changed from any to unknown
  font_settings: unknown; // Changed from any to unknown
  layout_config: unknown; // Changed from any to unknown
  animation_settings: unknown; // Changed from any to unknown
  drag_drop_title: string | null;
  drag_drop_instructions: string | null;
  drag_drop_items: unknown; // Changed from any to unknown
  drag_drop_categories: unknown; // Changed from any to unknown
}

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
          <CardDescription>
            Section slug is missing or invalid:{" "}
            <span className="font-mono">{sectionSlug}</span>
          </CardDescription>
          <p className="mt-2 text-muted-foreground">
            Course slug: <span className="font-mono">{slug}</span>
          </p>
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>URL Format Error</AlertTitle>
            <AlertDescription>
              Expected URL format:{" "}
              <span className="font-mono">
                /courses/course-slug/section-slug
              </span>
            </AlertDescription>
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
          <CardDescription>
            No course found with slug: <span className="font-mono">{slug}</span>
          </CardDescription>
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
          <CardDescription>
            No course path found for course:{" "}
            <span className="font-mono">{slug}</span>
          </CardDescription>
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
          <CardDescription>
            No section found with slug:{" "}
            <span className="font-mono">{sectionSlug}</span>
          </CardDescription>
          <p className="mt-2 text-muted-foreground">
            In course: <span className="font-mono">{slug}</span>
          </p>
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

  let itemsByBlock: Record<string, ContentItem[]> = {};
  if (blocks && blocks.length > 0) {
    const blockIds = blocks.map((b) => b.id);
    const { data: items, error: itemsError } = await supabase
      .from("content_item")
      .select(
        "id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_items, drag_drop_categories"
      )
      .in("block_id", blockIds);
    if (!itemsError && items) {
      // Transform database items to match ContentItem interface
      const transformedItems: ContentItem[] = (
        items as DatabaseContentItem[]
      ).map((item) => ({
        id: item.id,
        block_id: item.block_id,
        type: item.type as
          | "text"
          | "image"
          | "quiz"
          | "animation"
          | "calculator"
          | "math"
          | "chart",
        content_text: item.content_text || undefined,
        image_url: item.image_url || undefined,
        quiz_data: item.quiz_data,
        component_key: item.component_key || undefined,
        order_index: item.order_index,
        created_at: item.created_at,
      }));

      itemsByBlock = transformedItems.reduce(
        (acc: Record<string, ContentItem[]>, item) => {
          if (!acc[item.block_id]) acc[item.block_id] = [];
          acc[item.block_id].push(item);
          return acc;
        },
        {}
      );
    }
  }

  // Create blocks with the exact Block interface structure
  const blocksWithItems: Block[] = (blocks || []).map((block) => ({
    id: block.id,
    section_id: block.section_id,
    title: block.title,
    order_index: block.order_index,
    created_at: block.created_at,
    content_items: itemsByBlock[block.id] || [],
  }));

  // Sort blocks by order_index
  const sortedBlocks = [...blocksWithItems].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  );

  // Sort each block's content items by order_index
  sortedBlocks.forEach((block) => {
    if (block.content_items && Array.isArray(block.content_items)) {
      block.content_items.sort(
        (a, b) => (a.order_index || 0) - (b.order_index || 0)
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
          <p className="mt-2 text-muted-foreground">
            Section slug: <span className="font-mono">{sectionSlug}</span>
          </p>
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
