import { supabaseAdmin } from "@/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    const eventType = body.type;
    const user = body.data;

    const email = user.email_addresses?.[0]?.email_address || "empty@email.com";
    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    const clerk_id = user.id;

    if (!clerk_id) {
      return NextResponse.json({ error: "Missing Clerk ID" }, { status: 400 });
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      if (!email) {
        console.error(
          "Email is missing in webhook payload:",
          user.email_addresses
        );
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("users")
        .upsert({ clerk_id, email, name }, { onConflict: "clerk_id" });

      if (error) {
        console.error("Supabase upsert error:", error);
        return NextResponse.json(
          { error: "Supabase upsert failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (eventType === "user.deleted") {
      const { error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("clerk_id", clerk_id);

      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          { error: "Supabase delete failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
