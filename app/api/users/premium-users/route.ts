import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Premium users API called - using JWT authentication");

    // Get the current user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create JWT-authenticated Supabase client
    const supabase = await createSupabaseServerClient();

    // Get user data with explicit clerk_id filter to ensure we get the right user
    const { data: user, error } = await supabase
      .from("users")
      .select("role, subscription_plan, is_premium")
      .eq("clerk_id", userId)
      .single();
    console.log("JWT user query result:", { user, error });

    if (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      console.log("No user found");
      return NextResponse.json({
        is_premium: false,
        subscription_plan: null,
        role: "user",
      });
    }

    // Check if user has premium access (either is_premium=true OR role='beta')
    const hasPremiumAccess = user.is_premium === true || user.role === "beta";

    console.log(
      `User premium access: ${hasPremiumAccess} (is_premium: ${user.is_premium}, role: ${user.role})`
    );

    return NextResponse.json({
      is_premium: hasPremiumAccess,
      subscription_plan: user.subscription_plan,
      role: user.role,
    });
  } catch (error) {
    console.error("Premium users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
