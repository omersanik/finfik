import Stripe from "stripe";
import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const supabase = await createSupabaseServerClient();

    // Get user's subscription ID
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("subscription_id")
      .eq("clerk_id", userId)
      .single();

    if (fetchError || !user?.subscription_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        { status: 400 }
      );
    }

    console.log(
      "Creating customer portal for user:",
      userId,
      "subscription:",
      user.subscription_id
    );

    // Get the subscription to find the customer ID
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription_id
    );
    const customerId = subscription.customer as string;

    console.log("Found customer ID:", customerId);

    // Check if we have the required environment variables
    const returnUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
    console.log("Return URL:", returnUrl);

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnUrl}/subscription?portal=1`,
    });

    console.log("Customer portal session created successfully");
    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (error) {
    console.error("Customer portal error:", error);

    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === "StripeInvalidRequestError") {
        if (error.message.includes("configuration")) {
          return new Response(
            JSON.stringify({
              error:
                "Customer portal not configured in Stripe. Please contact support to set up subscription management.",
            }),
            { status: 500 }
          );
        }
        if (error.message.includes("customer")) {
          return new Response(
            JSON.stringify({
              error: "Invalid customer ID. Please contact support.",
            }),
            { status: 500 }
          );
        }
      }

      if (error.type === "StripeAuthenticationError") {
        return new Response(
          JSON.stringify({
            error: "Stripe authentication failed. Please check your API keys.",
          }),
          { status: 500 }
        );
      }
    }

    // Handle generic errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: `Failed to open customer portal: ${errorMessage}`,
      }),
      { status: 500 }
    );
  }
}
