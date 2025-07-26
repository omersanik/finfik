import { CreateSupabaseClient } from "@/supabase-client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = CreateSupabaseClient();
  const { searchParams } = new URL(req.url);
  const section_id = searchParams.get("section_id");

  if (!section_id) {
    return new Response(JSON.stringify({ error: "Missing section_id" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("content_block")
    .select("id, title")
    .eq("section_id", section_id)
    .order("order_index", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
} 