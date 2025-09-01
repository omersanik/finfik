import SectionClient from "@/components/SectionClient";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ContentItem, Block, QuizData } from "@/types/content";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Database types (what Supabase returns)
interface DatabaseContentItem {
  id: string;
  block_id: string;
  type: string;
  content_text: string | null;
  image_url: string | null;
  quiz_data: unknown;
  component_key: string | null;
  order_index: number;
  created_at: string;
  content_type: string | null;
  styling_data: unknown;
  math_formula: string | null;
  interactive_data: unknown;
  media_files: unknown;
  font_settings: unknown;
  layout_config: unknown;
  animation_settings: unknown;
  drag_drop_title: string | null;
  drag_drop_instructions: string | null;
  drag_drop_items: string | null;
  drag_drop_categories: string | null;
}

// Type guard function for quiz data
// Type guard function for quiz data
function isQuizData(data: unknown): data is QuizData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potentialQuizData = data as Record<string, unknown>;

  if (!("options" in potentialQuizData)) {
    return false;
  }

  if (!Array.isArray(potentialQuizData.options)) {
    return false;
  }

  // Validate that each option has the correct structure
  return potentialQuizData.options.every((option: unknown) => {
    if (typeof option !== "object" || option === null) {
      return false;
    }

    const potentialOption = option as Record<string, unknown>;
    return (
      typeof potentialOption.id === "string" &&
      typeof potentialOption.text === "string"
    );
  });
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

  console.time("Database Queries"); // Performance timing

  // BATCH 1: Run independent queries in parallel
  const [
    { data: course, error: courseError },
    { data: user, error: userError },
  ] = await Promise.all([
    supabase
      .from("courses")
      .select("id, is_premium_course")
      .eq("slug", slug)
      .single(),
    supabase.from("users").select("is_premium").eq("clerk_id", userId).single(),
  ]);

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

  // Check premium access early
  if (course.is_premium_course && (userError || !user || !user.is_premium)) {
    redirect("/subscription");
  }

  // BATCH 2: Get course path (depends on course.id)
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

  // BATCH 3: Get section (depends on coursePath.id)
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

  // BATCH 4: Run final queries in parallel (depend on section.id)
  const [
    { data: progress, error: progressError },
    { data: blocks, error: blocksError },
  ] = await Promise.all([
    supabase
      .from("course_path_section_progress")
      .select("unlocked, completed")
      .eq("clerk_id", userId)
      .eq("course_path_section_id", section.id)
      .single(),
    supabase
      .from("content_block")
      .select("id, section_id, title, order_index, created_at")
      .eq("section_id", section.id)
      .order("order_index", { ascending: true }),
  ]);

  if (progressError) {
    console.error("Error fetching progress:", progressError);
  }
  // If the section is not the first one (order > 0) and it's not unlocked, redirect
  if (section.order > 0 && (!progress || !progress.unlocked)) {
    return (
      <Card className="max-w-xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Whoops, not so fast!</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Looks like you&apos;re trying to skip ahead! Follow the learning
            path, you&apos;ll get there!
          </CardDescription>
          <p className="mt-2 text-muted-foreground">
            Return to your course to continue learning.
          </p>
          <Link
            href={`/courses/${slug}`}
            className="mt-4 inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Course
          </Link>
        </CardContent>
      </Card>
    );
  }

  // BATCH 5: Get content items (depends on blocks)
  let itemsByBlock: Record<string, ContentItem[]> = {};
  if (blocks && blocks.length > 0) {
    const blockIds = blocks.map((b) => b.id);
    const { data: items, error: itemsError } = await supabase
      .from("content_item")
      .select(
        "id, block_id, type, content_text, image_url, quiz_data, component_key, order_index, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_items, drag_drop_categories"
      )
      .in("block_id", blockIds);

    console.timeEnd("Database Queries"); // End performance timing

    if (!itemsError && items) {
      // Transform database items to match ContentItem interface
      const transformedItems: ContentItem[] = (
        items as DatabaseContentItem[]
      ).map((item) => {
        let quizData: QuizData | undefined = undefined;

        // Only set quiz_data if it's actually quiz data with the correct structure
        if (
          item.type === "quiz" &&
          item.quiz_data &&
          isQuizData(item.quiz_data)
        ) {
          quizData = item.quiz_data;
        }

        return {
          id: item.id,
          block_id: item.block_id,
          type: item.type as
            | "text"
            | "image"
            | "quiz"
            | "animation"
            | "calculator"
            | "math"
            | "chart"
            | "drag-drop",
          content_text: item.content_text || undefined,
          image_url: item.image_url || undefined,
          quiz_data: quizData, // Use the validated quiz data
          component_key: item.component_key || undefined,
          order_index: item.order_index,
          created_at: item.created_at,
          // Add drag-drop fields
          drag_drop_title: item.drag_drop_title || undefined,
          drag_drop_instructions: item.drag_drop_instructions || undefined,
          drag_drop_categories: item.drag_drop_categories || undefined,
          drag_drop_items: item.drag_drop_items || undefined,
        };
      });

      itemsByBlock = transformedItems.reduce(
        (acc: Record<string, ContentItem[]>, item) => {
          if (!acc[item.block_id]) acc[item.block_id] = [];
          acc[item.block_id].push(item);
          return acc;
        },
        {}
      );
    }
  } else {
    console.timeEnd("Database Queries"); // End timing even if no blocks
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
