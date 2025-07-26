import { NextRequest } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const supabase = CreateSupabaseClient();
    const body = await req.json();
    
    // Debug logging
    console.log("Content item POST request body:", body);
    
    const {
      block_id,
      type,
      content_text,
      image_url,
      quiz_data,
      component_key,
      order_index,
      quiz_question,
      content_type,
      styling_data,
      math_formula,
      interactive_data,
      media_files,
      font_settings,
      layout_config,
      animation_settings,
    } = body;
    
    console.log("Type being inserted:", type);
    
    // Extract math formula from content_text if type is math
    let extractedMathFormula = math_formula;
    let cleanedContentText = content_text;
    
    if (type === 'math' && content_text) {
      console.log("Processing math content:", content_text);
      // Extract formula from span tag
      const mathFormulaMatch = content_text.match(/data-formula="([^"]+)"/);
      if (mathFormulaMatch) {
        extractedMathFormula = mathFormulaMatch[1];
        console.log("Extracted math formula:", extractedMathFormula);
        // Remove the math formula span from content_text
        cleanedContentText = content_text.replace(/<span class="math-formula"[^>]*>.*?<\/span>/g, '');
        console.log("Cleaned content text:", cleanedContentText);
      }
    }
    
    const { data, error } = await supabase
      .from("content_item")
      .insert([
        {
          block_id: block_id || null,
          type: type || null,
          content_text: cleanedContentText || null,
          image_url: image_url || null,
          quiz_data: quiz_data || null,
          component_key: component_key || null,
          order_index: order_index ?? null,
          quiz_question: quiz_question || null,
          content_type: content_type || 'text',
          styling_data: styling_data || null,
          math_formula: extractedMathFormula || null,
          interactive_data: interactive_data || null,
          media_files: media_files || null,
          font_settings: font_settings || null,
          layout_config: layout_config || null,
          animation_settings: animation_settings || null,
        },
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Exception in POST:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  const supabase = CreateSupabaseClient();
  
  // First, let's see what types currently exist
  const { data: existingTypes, error: typesError } = await supabase
    .from("content_item")
    .select("type")
    .not("type", "is", null);
    
  if (!typesError && existingTypes) {
    const uniqueTypes = [...new Set(existingTypes.map(item => item.type))];
    console.log("Existing content item types in database:", uniqueTypes);
  }
  
  // Get a valid block_id to use for testing
  const { data: validBlock, error: blockError } = await supabase
    .from("content_block")
    .select("id")
    .limit(1)
    .single();
    
  if (blockError || !validBlock) {
    console.log("No valid block found for testing");
    return new Response(JSON.stringify({ 
      error: "No valid block found for testing",
      existingTypes: typesError ? null : [...new Set(existingTypes?.map(item => item.type) || [])]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Test just the basic types that we know should work
  const testTypes = ["text", "image", "quiz", "animation", "calculator", "math", "chart"];
  const testResults = [];
  
  for (const testType of testTypes) {
    try {
      const { error } = await supabase
        .from("content_item")
        .insert([{
          block_id: validBlock.id, // Use valid UUID
          type: testType,
          content_text: "test",
          order_index: 999
        }]);
      
      testResults.push({
        type: testType,
        allowed: !error,
        error: error?.message || null
      });
      
      // Clean up test data
      if (!error) {
        await supabase
          .from("content_item")
          .delete()
          .eq("block_id", validBlock.id)
          .eq("order_index", 999);
      }
    } catch (err) {
      testResults.push({
        type: testType,
        allowed: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }
  
  console.log("Database constraint test results:", testResults);
  
  const { data, error } = await supabase.from("content_item").select("*");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ 
    data, 
    testResults,
    existingTypes: typesError ? null : [...new Set(existingTypes?.map(item => item.type) || [])]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
} 