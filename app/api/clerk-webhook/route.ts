import { supabaseAdmin } from "@/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Event type:", body.type);
    console.log("User ID:", body.data?.id);
    console.log("Email:", body.data?.email_addresses?.[0]?.email_address);
    console.log("Full webhook payload:", JSON.stringify(body, null, 2));
    console.log("=== END WEBHOOK ===");

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

      // For new users, set role to 'beta' and is_premium to true
      // This gives them access to premium courses automatically
      const userData = {
        clerk_id, 
        email, 
        name,
        role: 'beta',
        is_premium: true
      };

      // First, check if user already exists by clerk_id
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("clerk_id, email, role")
        .eq("clerk_id", clerk_id)
        .single();

      if (existingUser) {
        // User exists, update with beta role if not already set
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ 
            email, 
            name, 
            role: 'beta', 
            is_premium: true 
          })
          .eq("clerk_id", clerk_id);

        if (updateError) {
          console.error("Supabase update error:", updateError);
          return NextResponse.json(
            { error: "Supabase update failed" },
            { status: 500 }
          );
        }
      } else {
        // User doesn't exist, insert new user
        const { error: insertError } = await supabaseAdmin
          .from("users")
          .insert([userData]);

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          return NextResponse.json(
            { error: "Supabase insert failed" },
            { status: 500 }
          );
        }
      }

      console.log(`User ${clerk_id} created/updated with beta role and premium access`);
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
