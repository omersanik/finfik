import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== GET request received for content item ===");

  // Await params for Next.js 15 compatibility
  const { id } = await params;
  console.log("Params:", { id });
  console.log("URL:", req.url);
  console.log("Method:", req.method);

  return NextResponse.json({
    message: "Route is working",
    params: { id },
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== PUT request received for content item ===");

  // Await params for Next.js 15 compatibility
  const { id } = await params;
  console.log("Params:", { id });
  console.log("URL:", req.url);
  console.log("Method:", req.method);

  try {
    // Simple authentication check
    const { userId } = await auth();
    if (!userId) {
      console.log("No userId found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("User authenticated:", userId);

    // Simple admin check
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user?.publicMetadata?.role;
      console.log("User role:", role);

      if (role !== "admin") {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
    } catch (clerkError) {
      console.error("Clerk error:", clerkError);
      return NextResponse.json(
        { error: "Admin check failed" },
        { status: 403 }
      );
    }

    // Get request body
    const requestBody = await req.json();
    console.log("Request body:", requestBody);

    const {
      type,
      content_text,
      order_index,
      block_id,
      section_id,
      course_id,
      image_url,
      quiz_data,
      quiz_question,
      math_formula,
      drag_drop_title,
      drag_drop_instructions,
      drag_drop_items,
      drag_drop_categories,
      component_key,
      content_type,
      styling_data,
      interactive_data,
      media_files,
      font_settings,
      layout_config,
      animation_settings,
    } = requestBody;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    // Build update object with all provided fields
    const updateData: Record<string, unknown> = {
      type,
    };

    // Only include fields that are provided in the request
    if (content_text !== undefined)
      updateData.content_text = content_text || null;
    if (order_index !== undefined) updateData.order_index = order_index || 0;
    if (block_id !== undefined) updateData.block_id = block_id;
    if (section_id !== undefined) updateData.section_id = section_id;
    if (course_id !== undefined) updateData.course_id = course_id;
    if (image_url !== undefined) updateData.image_url = image_url || null;
    if (quiz_data !== undefined) updateData.quiz_data = quiz_data || null;
    if (quiz_question !== undefined)
      updateData.quiz_question = quiz_question || null;
    if (math_formula !== undefined)
      updateData.math_formula = math_formula || null;
    if (drag_drop_title !== undefined)
      updateData.drag_drop_title = drag_drop_title || null;
    if (drag_drop_instructions !== undefined)
      updateData.drag_drop_instructions = drag_drop_instructions || null;
    if (drag_drop_items !== undefined)
      updateData.drag_drop_items = drag_drop_items || null;
    if (drag_drop_categories !== undefined)
      updateData.drag_drop_categories = drag_drop_categories || null;
    if (component_key !== undefined)
      updateData.component_key = component_key || null;
    if (content_type !== undefined)
      updateData.content_type = content_type || null;
    if (styling_data !== undefined)
      updateData.styling_data = styling_data || null;
    if (interactive_data !== undefined)
      updateData.interactive_data = interactive_data || null;
    if (media_files !== undefined) updateData.media_files = media_files || null;
    if (font_settings !== undefined)
      updateData.font_settings = font_settings || null;
    if (layout_config !== undefined)
      updateData.layout_config = layout_config || null;
    if (animation_settings !== undefined)
      updateData.animation_settings = animation_settings || null;

    console.log("Update data to be sent:", updateData);

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Attempting update...");

    const { data, error } = await supabase
      .from("content_item")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Update failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Update successful:", data);
    return NextResponse.json({
      message: "Content item updated successfully",
      item: data,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
