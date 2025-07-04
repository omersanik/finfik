import { NextRequest } from "next/server";
import { verifyToken } from "@clerk/backend";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) return new Response("Unauthorized", { status: 401 });

  let userId: string;
  try {
    // verifyToken returns the decoded JWT payload directly
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    // 'claims' has the userId as 'sub'
    userId = claims.sub;
    if (!userId) throw new Error("User ID (sub) missing in token claims");
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }

  const supabase = CreateSupabaseClient();

  const { data, error } = await supabase
    .from("course_enrollments")
    .select("courses(id, title, slug, thumbnail_url, description)")
    .eq("clerk_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data.map((e) => e.courses)), {
    status: 200,
  });
}
