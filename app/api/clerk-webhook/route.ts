import { supabaseAdmin } from "@/supabase-client";
import { NextResponse } from "next/server";
import { 
  handleClerkUserCreated, 
  handlePremiumUpgrade,
  initializeAllCoursesForUser 
} from "@/lib/db/actions/course-actions";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type: eventType, data } = payload;
    const clerk_id = data.id;

    console.log("📥 Webhook received:", eventType, "for user:", clerk_id);

    // Handle course-related actions
    if (eventType === "user.created") {
      console.log("👤 User created - initializing courses:", clerk_id);
      try {
        // Wait a moment for user to be fully created in your users table
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Initialize all courses for the new user
        await initializeAllCoursesForUser(clerk_id);
        
        console.log("✅ New user course initialization completed");
      } catch (courseError) {
        console.error("Course initialization error:", courseError);
        // Don't fail the webhook, but log the error
      }
    } else if (eventType === "user.updated") {
      console.log("👤 User updated event:", clerk_id);
      try {
        // Check if user's premium status changed
        const { data: user } = await supabaseAdmin
          .from("users")
          .select("is_premium")
          .eq("clerk_id", clerk_id)
          .single();

        if (user?.is_premium) {
          await handlePremiumUpgrade(clerk_id);
        }
      } catch (updateError) {
        console.error("User update handling error:", updateError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// Alternative manual trigger route for testing
// You can add this to a separate file: app/api/init-user-courses/route.ts
export async function PATCH(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await handleClerkUserCreated({ id: userId });

    return NextResponse.json({
      success: true,
      message: "User courses initialized successfully",
    });
  } catch (error) {
    console.error("Manual init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize user courses" },
      { status: 500 }
    );
  }
}
