import { NextRequest } from "next/server";
import Stripe from "stripe";
import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const supabase = CreateSupabaseClient();
    
    // Get user's subscription ID
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("subscription_id")
      .eq("clerk_id", userId)
      .single();

    if (fetchError || !user?.subscription_id) {
      return new Response(JSON.stringify({ error: "No active subscription found" }), { status: 400 });
    }

    // Get the subscription to find the customer ID
    const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
    const customerId = subscription.customer as string;

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?portal=1`,
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (error: any) {
    console.error("Customer portal error:", error);
    
    // Check if it's a configuration error
    if (error.type === 'StripeInvalidRequestError' && error.message.includes('configuration')) {
      return new Response(JSON.stringify({ 
        error: "Customer portal not configured. Please contact support to set up subscription management." 
      }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ 
      error: "Failed to open customer portal. Please try again or contact support." 
    }), { status: 500 });
  }
} 