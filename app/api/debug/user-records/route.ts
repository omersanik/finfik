import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createSupabaseServerClient();

  // Get ALL records for this user to see duplicates
  const { data: allRecords, error } = await supabase
    .from("users")
    .select(
      "id, clerk_id, role, is_premium, subscription_plan, created_at, updated_at"
    )
    .eq("clerk_id", userId)
    .order("updated_at", { ascending: false });

  return new Response(
    JSON.stringify({
      userId,
      totalRecords: allRecords?.length || 0,
      records: allRecords,
      error,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
