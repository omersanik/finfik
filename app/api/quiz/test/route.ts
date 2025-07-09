import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from("content_item")
      .select("id, type, quiz_question, quiz_data")
      .eq("type", "quiz")
      .limit(1);

    console.log("Test query result:", { testData, testError });

    if (testError) {
      return NextResponse.json(
        { error: "Database connection failed", details: testError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Database connection successful",
      quizItemsFound: testData?.length || 0,
      sampleData: testData?.[0] || null
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error },
      { status: 500 }
    );
  }
} 