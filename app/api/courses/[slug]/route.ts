import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params first
    const { slug } = await params;

    // 1. Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = supabaseAdmin;

    console.log("Fetching course with slug:", slug);

    // 2. Get course by slug
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();

    console.log("Course query result:", { course, courseError });

    if (courseError || !course) {
      console.error("Course not found:", { slug, courseError });
      return NextResponse.json(
        { error: `Course not found for slug: ${slug}` },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
