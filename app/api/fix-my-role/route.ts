import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data from Supabase
    const { data: userData, error: dbError } = await supabaseAdmin
      .from("users")
      .select("role, is_premium")
      .eq("clerk_id", userId)
      .single();

    if (dbError || !userData) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Update Clerk's public metadata to match Supabase
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        role: userData.role,
        is_premium: userData.is_premium,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Role metadata synchronized",
      role: userData.role,
      is_premium: userData.is_premium,
    });
  } catch (error) {
    console.error("Fix role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
