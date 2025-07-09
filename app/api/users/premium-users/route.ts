import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = CreateSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("is_premium")
    .eq("clerk_id", userId)
    .single();

  if (error || !user) {
    return new Response(JSON.stringify({ error: error?.message || "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ is_premium: user.is_premium }), { status: 200 });
}
