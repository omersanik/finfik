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

  // Get ALL records for this user (not just single)
  const { data: allRecords, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Find the duplicate records
  const premiumRoleRecord = allRecords?.find((r) => r.role === "premium");
  const betaRoleRecord = allRecords?.find((r) => r.role === "beta");

  return new Response(
    JSON.stringify({
      userId,
      totalRecords: allRecords?.length || 0,
      allRecords,
      premiumRoleRecord,
      betaRoleRecord,
      hasDuplicates: (allRecords?.length || 0) > 1,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createSupabaseServerClient();

  // Find and delete the beta role record (keep the premium one)
  const { data: betaRecord, error: findError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .eq("role", "beta")
    .single();

  if (findError || !betaRecord) {
    return new Response(
      JSON.stringify({ message: "No beta record found to delete" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Delete the beta record
  const { error: deleteError } = await supabase
    .from("users")
    .delete()
    .eq("id", betaRecord.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      message: "Beta record deleted successfully",
      deletedRecordId: betaRecord.id,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
