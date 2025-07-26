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
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
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
    if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
      subscriptionPlan = "monthly";
    } else if (priceId === process.env.STRIPE_YEARLY_PRICE_ID) {
      subscriptionPlan = "yearly";
    }
    console.log("Checkout session completed for userId:", userId, "subscriptionId:", subscriptionId, "plan:", subscriptionPlan);
    if (userId) {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_premium: true, subscription_id: subscriptionId || null, subscription_plan: subscriptionPlan })
        .eq("clerk_id", userId);
      if (error) {
        console.error("Supabase update error:", error);
      } else {
        console.log("User upgraded to premium:", userId);
      }
    } else {
      console.error("No userId found in session metadata");
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
} 