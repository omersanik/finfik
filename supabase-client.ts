import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // backend only, never expose to frontend
);

// Create a Supabase client for server-side usage with Clerk auth token
export async function createSupabaseServerClient(
  req: NextRequest
): Promise<SupabaseClient> {
  const { getToken } = getAuth(req);
  const token = await getToken({ template: "supabase" });

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      },
    }
  );
}
