import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createSupabaseServerClient();

  // Check for ALL records with this clerk_id (not just single)
  const { data: allRecords, error: allError } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId);

  // Also do the specific query that the premium API uses
  const { data: specificRecord, error: specificError } = await supabase
    .from("users")
    .select("is_premium, subscription_plan, role")
    .eq("clerk_id", userId)
    .single();

  return new Response(
    JSON.stringify({
      userId,
      recordCount: allRecords?.length || 0,
      allRecords,
      allError,
      specificRecord,
      specificError,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    }
  );
}
