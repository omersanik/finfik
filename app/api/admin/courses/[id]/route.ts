import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ no need to "await clerkClient()" here
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user?.publicMetadata?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const {
      title,
      description,
      slug,
      thumbnail_url,
      is_premium,
      course_level,
    } = await req.json();

    if (!title || !description || !slug) {
      return NextResponse.json(
        { error: "Title, description, and slug are required" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("courses")
      .update({
        title,
        description,
        slug,
        thumbnail_url: thumbnail_url || null,
        is_premium: is_premium || false,
        course_level: course_level || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.params.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating course:", error);
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Course updated successfully",
      course: data,
    });
  } catch (error) {
    console.error("Error in update course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
