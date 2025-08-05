import { NextRequest } from "next/server";
import { verifyToken } from "@clerk/backend";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(req: NextRequest) {
  // Get authorization header and extract token
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let userId: string;
  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    userId = claims.sub;
    if (!userId) throw new Error("User ID (sub) missing in token claims");
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  const supabase = CreateSupabaseClient();

  // Query course_enrollments joined with courses to get course info
  const { data, error } = await supabase
    .from("course_enrollments")
    .select(
      `
      last_accessed,
      courses (
        id,
        title,
        slug,
        thumbnail_url,
        description,
        course_level
      )
    `
    )
    .eq("clerk_id", userId)
    .order("last_accessed", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!data || !data.courses) {
    // No recent course found
    return new Response(JSON.stringify(null), { status: 200 });
  }

  // Return the course details only
  return new Response(JSON.stringify(data.courses), { status: 200 });
}
