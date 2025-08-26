import { supabaseAdmin } from "@/supabase-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clerk_id, email, name } = body;

    if (!clerk_id || !email || !name) {
      return NextResponse.json({ 
        error: "Missing required fields: clerk_id, email, name" 
      }, { status: 400 });
    }

    // Create beta user
    const userData = {
      clerk_id,
      email,
      name,
      role: 'beta',
      is_premium: true
    };

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error("Error creating beta user:", error);
      return NextResponse.json({ 
        error: "Failed to create beta user",
        details: error 
      }, { status: 500 });
    }

    console.log("Beta user created successfully:", data);

    return NextResponse.json({ 
      success: true, 
      user: data 
    });

  } catch (error) {
    console.error("Test beta user API error:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
