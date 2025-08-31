import { createSupabaseServerClient } from "@/supabase-client";

export async function GET() {
  // This endpoint can only be called from server-side (no browser access)
  // Check if this is being called from server environment
  if (typeof window !== "undefined") {
    return new Response(
      JSON.stringify({ error: "Browser access not allowed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Fix the specific user's role back to premium
  const { data, error } = await supabase
    .from("users")
    .update({
      role: "premium",
    })
    .eq("clerk_id", "user_2yC4fnyxPa4OG6ngfULhN1QchOu")
    .eq("is_premium", true) // Extra safety check
    .select()
    .single();

  if (error) {
    console.error("Error fixing user role:", error);
    return new Response(
      JSON.stringify({ error: "Database error", details: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Role fixed back to premium",
      user: data,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
