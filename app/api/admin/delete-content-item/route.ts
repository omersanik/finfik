import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentItemId, adminPassword } = await request.json();
    if (!contentItemId) {
      return NextResponse.json({ error: "Content item ID is required" }, { status: 400 });
    }

    // Verify admin password
    if (adminPassword !== "yavheheAa1@") {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 403 });
    }

    const supabase = CreateSupabaseClient();

    // Delete the content item
    const { error } = await supabase
      .from("content_item")
      .delete()
      .eq("id", contentItemId);

    if (error) {
      console.error("Error deleting content item:", error);
      return NextResponse.json({ error: "Failed to delete content item" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Content item deleted successfully" });
  } catch (error) {
    console.error("Error in delete content item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
