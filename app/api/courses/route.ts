import { NextResponse } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET() {
  const supabase = CreateSupabaseClient();
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
