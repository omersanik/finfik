import { supabaseAdmin } from "@/supabase-client";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🚨🚨🚨 CLERK WEBHOOK RECEIVED AT:", new Date().toISOString());
    console.log("Event type:", body.type);
    console.log("User ID:", body.data?.id);
    console.log("Email:", body.data?.email_addresses?.[0]?.email_address);
    console.log("🚨 CHECKING IF THIS IS AVATAR UPDATE RELATED");
    console.log("Full webhook payload:", JSON.stringify(body, null, 2));
    console.log("🚨🚨🚨 END WEBHOOK ===");

    const eventType = body.type;
    const user = body.data;

    const email = user.email_addresses?.[0]?.email_address || "empty@email.com";
    const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    const clerk_id = user.id;

    if (!clerk_id) {
      return NextResponse.json({ error: "Missing Clerk ID" }, { status: 400 });
    }

    if (eventType === "user.created") {
      if (!email) {
        console.error(
          "Email is missing in webhook payload:",
          user.email_addresses
        );
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      // For NEW users only, set role to 'beta' and is_premium to true
      // This gives them access to premium courses automatically
      const userData = {
        clerk_id,
        email,
        name,
        role: "beta",
        is_premium: true,
      };

      // Insert new user with beta role in Supabase
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

      // Also update Clerk's public metadata so JWT template can access the role
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(clerk_id, {
          publicMetadata: {
            role: "beta",
            is_premium: true,
          },
        });
        console.log(`Updated Clerk public metadata for user ${clerk_id}`);
      } catch (clerkError) {
        console.error("Failed to update Clerk metadata:", clerkError);
        // Don't fail the entire webhook if metadata update fails
      }

      console.log(
        `New user ${clerk_id} created with beta role and premium access`
      );
      return NextResponse.json({ success: true });
    }

    if (eventType === "user.updated") {
      console.log("🔥🔥🔥 USER.UPDATED EVENT - AVATAR UPDATE TRIGGER?");
      console.log("🔥 Timestamp:", new Date().toISOString());
      console.log("🔥 Clerk ID:", clerk_id);
      console.log("🔥 Email:", email);
      console.log("🔥 Name:", name);
      console.log("🔥 About to update users table with ONLY email and name");

      if (!email) {
        console.error(
          "Email is missing in webhook payload:",
          user.email_addresses
        );
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      // For EXISTING users, only update email and name - PRESERVE existing role and premium status
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("role, is_premium")
        .eq("clerk_id", clerk_id)
        .single();

      if (fetchError) {
        console.error("🔥 ERROR FETCHING EXISTING USER:", fetchError);
        return NextResponse.json(
          { error: "Failed to fetch existing user" },
          { status: 500 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({
          email,
          name,
          // DO NOT update role or is_premium - preserve existing values
        })
        .eq("clerk_id", clerk_id);

      if (updateError) {
        console.error("🔥 SUPABASE UPDATE ERROR:", updateError);
        return NextResponse.json(
          { error: "Supabase update failed" },
          { status: 500 }
        );
      }

      // Also sync the role to Clerk's public metadata for JWT template
      if (existingUser) {
        try {
          const clerk = await clerkClient();
          await clerk.users.updateUser(clerk_id, {
            publicMetadata: {
              role: existingUser.role,
              is_premium: existingUser.is_premium,
            },
          });
          console.log(
            `🔥 Updated Clerk public metadata for existing user ${clerk_id} with role: ${existingUser.role}`
          );
        } catch (clerkError) {
          console.error("🔥 Failed to update Clerk metadata:", clerkError);
          // Don't fail the entire webhook if metadata update fails
        }
      }

      console.log(
        `🔥 COMPLETED: Existing user ${clerk_id} updated - preserved role and premium status`
      );
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
