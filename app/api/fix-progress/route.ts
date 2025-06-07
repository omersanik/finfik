import { NextResponse } from "next/server";
import { fixEmptyProgressTables } from "@/lib/db/actions/course-actions";

export async function POST() {
  console.log("🚀 Starting fix-progress endpoint");
  try {
    console.log("📝 Calling fixEmptyProgressTables function");
    await fixEmptyProgressTables();
    console.log("✅ fixEmptyProgressTables completed successfully");
    return NextResponse.json({ success: true, message: "Progress tables fixed successfully" });
  } catch (error) {
    console.error("❌ Error in fix-progress endpoint:", error);
    return NextResponse.json(
      { success: false, message: "Error fixing progress tables", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 