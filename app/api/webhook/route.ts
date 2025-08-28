import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Redirect to the correct Stripe webhook endpoint
  const url = new URL("/api/stripe/webhook", req.url);
  
  // Forward the request to the correct endpoint
  const response = await fetch(url, {
    method: "POST",
    headers: req.headers,
    body: await req.text(),
  });
  
  return response;
} 