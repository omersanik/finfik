import { supabaseAdmin } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Type guard function for quiz data
interface QuizData {
  options: Array<{ id: string; text: string }>;
}

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  // Verify user authentication
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.time(`Heavy Content Load - ${itemId}`);

  const supabase = supabaseAdmin;

  // Load ONLY the heavy fields for this specific item
  const { data: item, error } = await supabase
    .from("content_item")
    .select(
      "id, type, quiz_data, created_at, content_type, styling_data, math_formula, interactive_data, media_files, font_settings, layout_config, animation_settings, drag_drop_title, drag_drop_instructions, drag_drop_items, drag_drop_categories"
    )
    .eq("id", itemId)
    .single();

  console.timeEnd(`Heavy Content Load - ${itemId}`);

  if (error || !item) {
    return new Response(JSON.stringify({ error: "Content item not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Process heavy data
  const processedData: Record<string, unknown> = {
    id: item.id,
    created_at: item.created_at,
  };

  // Only process quiz data if it's valid
  if (item.type === "quiz" && item.quiz_data && isQuizData(item.quiz_data)) {
    processedData.quiz_data = item.quiz_data;
  }

  // Add drag-drop data if present
  if (item.type === "drag-drop") {
    processedData.drag_drop_title = item.drag_drop_title;
    processedData.drag_drop_instructions = item.drag_drop_instructions;
    processedData.drag_drop_categories = item.drag_drop_categories;
    processedData.drag_drop_items = item.drag_drop_items;
  }

  // Add other heavy fields as needed
  if (item.math_formula) processedData.math_formula = item.math_formula;
  if (item.interactive_data)
    processedData.interactive_data = item.interactive_data;
  if (item.styling_data) processedData.styling_data = item.styling_data;

  return new Response(JSON.stringify(processedData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Cache for 5 minutes - heavy data doesn't change often
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
    },
  });
}
