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

    // Fetch the quiz data from the content_item table
    const { data: contentItem, error: contentError } = await supabase
      .from("content_item")
      .select("*")
      .eq("id", id)
      .eq("type", "quiz")
      .single();

    console.log("Quiz API Debug:", { id, contentItem, contentError });

    if (contentError) {
      console.error("Supabase error:", contentError);
      return NextResponse.json(
        { error: "Database error", details: contentError },
        { status: 500 }
      );
    }

    if (!contentItem) {
      return NextResponse.json(
        { error: "Quiz not found", id },
        { status: 404 }
      );
    }

    console.log("Content item found:", {
      id: contentItem.id,
      type: contentItem.type,
      quiz_question: contentItem.quiz_question,
      quiz_data: contentItem.quiz_data
    });

    // Parse the quiz_data JSON and format it properly
    let quizData;
    try {
      let rawData;
      
      if (typeof contentItem.quiz_data === "string") {
        console.log("Original quiz data:", contentItem.quiz_data);
        
        // Handle the specific format: ["option1", 'option2']
        let cleanedData = contentItem.quiz_data;
        
        // First, replace the escaped double quotes with a temporary marker
        cleanedData = cleanedData.replace(/\\"/g, "___TEMP_QUOTE___");
        
        // Replace single quotes with double quotes
        cleanedData = cleanedData.replace(/'/g, '"');
        
        // Restore the original escaped quotes
        cleanedData = cleanedData.replace(/___TEMP_QUOTE___/g, '\\"');
        
        console.log("Cleaned quiz data:", cleanedData);
        
        try {
          rawData = JSON.parse(cleanedData);
        } catch (parseError) {
          console.error("Parse failed:", parseError);
          
          // Fallback: manually parse the array using regex to handle commas within quotes
          const match = contentItem.quiz_data.match(/\[(.*)\]/);
          if (match) {
            const optionsString = match[1];
            // Use regex to split by comma, but not within quotes
            const options = optionsString.match(/"([^"]*(?:\\"[^"]*)*)"|'([^']*(?:\\'[^']*)*)'/g);
            if (options) {
              rawData = options.map((option: string) => {
                return option.trim()
                  .replace(/^["']/, '')  // Remove leading quote
                  .replace(/["']$/, '')  // Remove trailing quote
                  .replace(/\\"/g, '"')  // Unescape quotes
                  .replace(/\\'/g, "'"); // Unescape single quotes
              });
            } else {
              // If regex matching fails, try splitting by comma but be more careful
              const options = optionsString.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((option: string) => {
                return option.trim()
                  .replace(/^["']/, '')  // Remove leading quote
                  .replace(/["']$/, '')  // Remove trailing quote
                  .replace(/\\"/g, '"')  // Unescape quotes
                  .replace(/\\'/g, "'"); // Unescape single quotes
              });
              rawData = options;
            }
            console.log("Manually parsed options:", rawData);
          } else {
            throw new Error("Could not parse quiz data");
          }
        }
      } else {
        rawData = contentItem.quiz_data;
      }
      
      console.log("Parsed quiz data:", rawData);
      
      // Format the data to match expected structure
      quizData = {
        question: contentItem.quiz_question || "Quiz Question",
        options: rawData.map((option: string, index: number) => ({
          id: `option_${index}`,
          text: option,
          isCorrect: index === 0 // First option is correct
        }))
      };
      
      console.log("Formatted quiz data:", quizData);
    } catch (parseError) {
      console.error("Parse error:", parseError);
      console.error("Original data that failed to parse:", contentItem.quiz_data);
      return NextResponse.json(
        { 
          error: "Invalid quiz data format", 
          details: parseError instanceof Error ? parseError.message : String(parseError), 
          originalData: contentItem.quiz_data 
        },
        { status: 400 }
      );
    }

    console.log("Returning quiz data:", quizData);
    return NextResponse.json(quizData);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 