import { CreateSupabaseClient } from "@/supabase-client";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = CreateSupabaseClient();

  try {
    // Fetch all course paths with their ID and name
    const { data, error } = await supabase
      .from("course_path")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
