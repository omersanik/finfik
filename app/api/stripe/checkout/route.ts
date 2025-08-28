import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  yearly: process.env.STRIPE_YEARLY_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();
    if (!plan || !["monthly", "yearly"].includes(plan) || !userId) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
      });
    }
    const priceId = PRICE_IDS[plan as "monthly" | "yearly"];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Price ID not found" }), {
        status: 400,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=1`,
      metadata: { userId },
      customer_email: undefined, // Optionally pass user email
      expand: ["line_items"],
    });
    return new Response(JSON.stringify({ url: session.url }), { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
