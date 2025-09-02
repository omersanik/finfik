import { supabaseAdmin } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { course_id } = await req.json();
    if (!course_id) return new Response("Missing course_id", { status: 400 });

    const supabase = supabaseAdmin;

    const { error } = await supabase
      .from("course_enrollments")
      .update({ last_accessed: new Date().toISOString() })
      .eq("clerk_id", userId)
      .eq("course_id", course_id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "last_accessed updated" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating last accessed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
