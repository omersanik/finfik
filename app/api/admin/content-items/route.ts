import { NextRequest } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(req: NextRequest) {
  try {
    const supabase = CreateSupabaseClient();
    const body = await req.json();
    const {
      block_id,
      type,
      content_text,
      image_url,
      quiz_data,
      component_key,
      order_index,
      quiz_question,
    } = body;
    const { data, error } = await supabase
      .from("content_item")
      .insert([
        {
          block_id: block_id || null,
          type: type || null,
          content_text: content_text || null,
          image_url: image_url || null,
          quiz_data: quiz_data || null,
          component_key: component_key || null,
          order_index: order_index ?? null,
          quiz_question: quiz_question || null,
        },
      ])
      .select()
      .single();
    if (error) {
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 