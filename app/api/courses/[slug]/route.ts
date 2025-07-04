import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Await params first
  const { slug } = await params;

  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = CreateSupabaseClient();

  // 2. Get course by slug
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    return NextResponse.json(
      { error: `Course not found for slug: ${slug}` },
      { status: 404 }
    );
  }

  return NextResponse.json(course);
}
