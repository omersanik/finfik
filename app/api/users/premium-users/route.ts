import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = CreateSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("is_premium, subscription_plan")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    console.error("Database error:", error);
    // If user doesn't exist, create them with default values
    if (error.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([{ clerk_id: userId, is_premium: false, subscription_plan: null }])
        .select("is_premium, subscription_plan")
        .single();
      
      if (createError) {
        console.error("Error creating user:", createError);
        return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
      }
      
      return new Response(JSON.stringify({ is_premium: newUser.is_premium, subscription_plan: newUser.subscription_plan }), { status: 200 });
    }
    
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ is_premium: user.is_premium, subscription_plan: user.subscription_plan }), { status: 200 });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const supabase = CreateSupabaseClient();
  const body = await req.json();
  const { is_premium } = body;
  if (is_premium === false) {
    // Get the user's subscription ID
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("subscription_id")
      .eq("clerk_id", userId)
      .single();
    if (fetchError || !user?.subscription_id) {
      return new Response(JSON.stringify({ error: "No subscription to cancel." }), { status: 400 });
    }
    // Cancel the Stripe subscription
    try {
      await stripe.subscriptions.cancel(user.subscription_id);
    } catch (err: any) {
      return new Response(JSON.stringify({ error: "Failed to cancel Stripe subscription." }), { status: 500 });
    }
    // Find all premium course IDs
    const { data: premiumCourses, error: premiumError } = await supabase
      .from("courses")
      .select("id")
      .eq("is_premium_course", true);
    if (premiumError) {
      return new Response(JSON.stringify({ error: premiumError.message }), { status: 500 });
    }
    const premiumCourseIds = (premiumCourses || []).map((c) => c.id);
    if (premiumCourseIds.length > 0) {
      // Remove enrollments for premium courses
      await supabase.from("course_enrollments").delete().eq("clerk_id", userId).in("course_id", premiumCourseIds);
      // Remove progress for premium courses
      // First, get all course_path_section ids for premium courses
      const { data: coursePaths, error: pathError } = await supabase
        .from("course_path")
        .select("id, course_id")
        .in("course_id", premiumCourseIds);
      if (!pathError && coursePaths && coursePaths.length > 0) {
        const coursePathIds = coursePaths.map((p) => p.id);
        const { data: sectionIds, error: sectionError } = await supabase
          .from("course_path_sections")
          .select("id, course_path_id")
          .in("course_path_id", coursePathIds);
        if (!sectionError && sectionIds && sectionIds.length > 0) {
          const sectionIdList = sectionIds.map((s) => s.id);
          await supabase.from("course_path_section_progress").delete().eq("clerk_id", userId).in("course_path_section_id", sectionIdList);
        }
      }
    }
    // Update user in DB
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_premium: false, subscription_id: null, subscription_plan: null })
      .eq("clerk_id", userId);
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  if (typeof is_premium !== "boolean") {
    return new Response(JSON.stringify({ error: "Missing or invalid is_premium value" }), { status: 400 });
  }
  const { error } = await supabase
    .from("users")
    .update({ is_premium })
    .eq("clerk_id", userId);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
