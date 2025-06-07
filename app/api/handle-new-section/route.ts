import { NextResponse } from "next/server";
import { handleNewSectionAdded } from "@/lib/db/actions/course-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, coursePathId, order } = body;

    if (!sectionId || !coursePathId || typeof order !== "number") {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await handleNewSectionAdded(sectionId, coursePathId, order);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling new section:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 