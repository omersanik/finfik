import { NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/supabase-client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  console.log("Stripe webhook received!");
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
    console.log("Stripe event:", event.type);
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown webhook error";
    console.error("Webhook Error:", errorMessage);
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string | undefined;

    // Fetch the full session with expanded line_items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items"],
    });

    let subscriptionPlan = null;
    let priceId = undefined;
    if (fullSession.line_items && fullSession.line_items.data?.[0]?.price?.id) {
      priceId = fullSession.line_items.data[0].price.id;
    }

    console.log("Price ID from Stripe:", priceId);
    console.log("Environment variables:");
    console.log(
      "  STRIPE_MONTHLY_PRICE_ID:",
      process.env.STRIPE_MONTHLY_PRICE_ID
    );
    console.log(
      "  STRIPE_YEARLY_PRICE_ID:",
      process.env.STRIPE_YEARLY_PRICE_ID
    );

    if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
      subscriptionPlan = "monthly";
      console.log("Matched monthly price ID");
    } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      subscriptionPlan = "yearly";
      console.log("Matched yearly price ID");
    } else {
      console.log("Price ID did not match any known plans");
    }

    console.log("Final subscription plan:", subscriptionPlan);
    console.log(
      "Checkout session completed for userId:",
      userId,
      "subscriptionId:",
      subscriptionId,
      "plan:",
      subscriptionPlan
    );
    if (userId) {
      // First, try to update the user if they exist
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          is_premium: true,
          subscription_id: subscriptionId || null,
          subscription_plan: subscriptionPlan,
        })
        .eq("clerk_id", userId);

      if (updateError) {
        console.error("Supabase update error:", updateError);

        // If user doesn't exist, create them
        if (updateError.code === "PGRST116") {
          const { error: createError } = await supabaseAdmin
            .from("users")
            .insert([
              {
                clerk_id: userId,
                is_premium: true,
                subscription_id: subscriptionId || null,
                subscription_plan: subscriptionPlan,
              },
            ]);

          if (createError) {
            console.error("Failed to create user:", createError);
          } else {
            console.log("User created and upgraded to premium:", userId);
          }
        }
      } else {
        console.log("User upgraded to premium:", userId);
      }
    } else {
      console.error("No userId found in session metadata");
    }
  }

  // Handle subscription cancellation with grace period
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log("Subscription deleted:", subscription.id);

    // Find user by subscription ID
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("clerk_id, subscription_id")
      .eq("subscription_id", subscription.id)
      .single();

    if (fetchError || !user) {
      console.error("User not found for subscription:", subscription.id);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Check if subscription was canceled at period end (grace period)
    if (subscription.cancel_at_period_end) {
      console.log(
        "Subscription canceled at period end - keeping premium until end of current period"
      );
      // Keep premium status until the end of the current period
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          subscription_plan: null,
          subscription_id: null,
          // Don't set is_premium to false yet - it will be handled when the period actually ends
        })
        .eq("clerk_id", user.clerk_id);

      if (updateError) {
        console.error("Error updating user for grace period:", updateError);
      }
    } else {
      // Immediate cancellation - remove premium access
      console.log(
        "Subscription immediately canceled - removing premium access"
      );
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          is_premium: false,
          subscription_id: null,
          subscription_plan: null,
        })
        .eq("clerk_id", user.clerk_id);

      if (updateError) {
        console.error("Error removing premium access:", updateError);
      }
    }
  }

  // Handle subscription updates (like when grace period ends)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    console.log(
      "Subscription updated:",
      subscription.id,
      "status:",
      subscription.status
    );

    // Find user by subscription ID
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("clerk_id")
      .eq("subscription_id", subscription.id)
      .single();

    if (!fetchError && user) {
      if (
        subscription.status === "canceled" ||
        subscription.status === "unpaid"
      ) {
        console.log("Removing premium access for user:", user.clerk_id);
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            is_premium: false,
            subscription_id: null,
            subscription_plan: null,
          })
          .eq("clerk_id", user.clerk_id);

        if (updateError) {
          console.error("Error removing premium access:", updateError);
        }
      } else if (subscription.status === "active") {
        // Ensure premium status is active for active subscriptions
        console.log("Ensuring premium access for user:", user.clerk_id);
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ is_premium: true })
          .eq("clerk_id", user.clerk_id);

        if (updateError) {
          console.error("Error ensuring premium access:", updateError);
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
