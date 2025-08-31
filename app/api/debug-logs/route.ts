import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only allow this specific user to check logs
  if (userId !== "user_2yC4fnyxPa4OG6ngfULhN1QchOu") {
    return new Response(
      JSON.stringify({ error: "Not authorized for this action" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Check if the user_update_log table exists and get recent logs
    const { data: logs, error } = await supabase
      .from("user_update_log")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching update logs:", error);
      return new Response(
        JSON.stringify({
          error: "Database error",
          details:
            "User update log table might not exist yet. Run the SQL script first.",
          sqlError: error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Also get current user state
    const { data: currentUser } = await supabase
      .from("users")
      .select("role, is_premium, updated_at")
      .eq("clerk_id", userId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: "User update logs retrieved",
        currentUser,
        recentLogs: logs,
        logCount: logs?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in debug logs endpoint:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
