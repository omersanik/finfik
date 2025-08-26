import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, title, description, priority, email } = body;

    // Validate required fields
    if (!category || !title || !description || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify user is a beta user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    if (user.role !== 'beta') {
      return NextResponse.json(
        { error: "Only beta users can submit feedback" }, 
        { status: 403 }
      );
    }

    // Insert feedback into database
    const { data: feedback, error: feedbackError } = await supabase
      .from("beta_feedback")
      .insert([
        {
          clerk_id: userId,
          category,
          title,
          description,
          priority,
          contact_email: email || null,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (feedbackError) {
      console.error("Feedback insertion error:", feedbackError);
      return NextResponse.json(
        { error: "Failed to submit feedback" }, 
        { status: 500 }
      );
    }

    console.log(`Beta feedback submitted by ${userId}:`, {
      category,
      title,
      priority,
      hasEmail: !!email
    });

    return NextResponse.json({ 
      success: true, 
      feedback_id: feedback.id 
    });

  } catch (error) {
    console.error("Beta feedback API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createSupabaseServerClient();

    // Verify user is a beta user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    if (user.role !== 'beta') {
      return NextResponse.json(
        { error: "Only beta users can view feedback" }, 
        { status: 403 }
      );
    }

    // Get user's feedback history
    const { data: feedback, error: feedbackError } = await supabase
      .from("beta_feedback")
      .select("*")
      .eq("clerk_id", userId)
      .order("created_at", { ascending: false });

    if (feedbackError) {
      console.error("Feedback retrieval error:", feedbackError);
      return NextResponse.json(
        { error: "Failed to retrieve feedback" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error("Beta feedback GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
