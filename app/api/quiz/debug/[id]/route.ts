import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log("Debug endpoint called with ID:", id);

    // Fetch the raw content item
    const { data: contentItem, error: contentError } = await supabase
      .from("content_item")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Raw content item:", contentItem);
    console.log("Content error:", contentError);

    if (contentError) {
      return NextResponse.json({
        error: "Database error",
        details: contentError,
        id
      });
    }

    if (!contentItem) {
      return NextResponse.json({
        error: "Item not found",
        id
      });
    }

    // Try to parse the quiz_data
    let parsedData = null;
    let parseError = null;
    
    try {
      if (typeof contentItem.quiz_data === "string") {
        parsedData = JSON.parse(contentItem.quiz_data);
      } else {
        parsedData = contentItem.quiz_data;
      }
    } catch (error) {
      parseError = error;
    }

    return NextResponse.json({
      success: true,
      id,
      contentItem: {
        id: contentItem.id,
        type: contentItem.type,
        quiz_question: contentItem.quiz_question,
        quiz_data: contentItem.quiz_data,
        quiz_data_type: typeof contentItem.quiz_data
      },
      parsedData,
      parseError: parseError instanceof Error ? parseError.message : String(parseError)
    });

  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 