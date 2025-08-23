import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  
  // Get the user's current subscription details
  const { data, error } = await supabase
    .from("users")
    .select("is_premium, subscription_plan, subscription_id")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ 
    user: data 
  }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { subscription_plan } = body;

  if (!subscription_plan || !['monthly', 'yearly'].includes(subscription_plan)) {
    return new Response(JSON.stringify({ error: "Invalid subscription plan. Must be 'monthly' or 'yearly'" }), { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  
  // Update the user's subscription plan
  const { data, error } = await supabase
    .from("users")
    .update({ subscription_plan })
    .eq("clerk_id", userId)
    .select("is_premium, subscription_plan, subscription_id");

  if (error) {
    console.error("Error updating subscription plan:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    user: data[0] 
  }), { 
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
