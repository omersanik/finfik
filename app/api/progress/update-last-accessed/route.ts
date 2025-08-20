import { CreateSupabaseClient } from "@/supabase-client";
import { verifyToken } from "@clerk/backend";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return new Response("Unauthorized", { status: 401 });

  let userId: string;
  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    userId = claims.sub;
  } catch {
    return new Response("Invalid token", { status: 401 });
  }

  const { course_id } = await req.json();
  if (!course_id) return new Response("Missing course_id", { status: 400 });

  const supabase = CreateSupabaseClient();

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
      'Content-Type': 'application/json'
    }
  });
}
