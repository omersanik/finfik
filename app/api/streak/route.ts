import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";

function getLast7Days() {
  const today = new Date();
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    last7Days.push(date);
  }
  
  return last7Days;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = CreateSupabaseClient();

  // Get streak info
  const { data: streakData, error: streakError } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_completed_date")
    .eq("clerk_id", userId)
    .single();

  // Get all completed_at dates for the last 7 days
  const last7Days = getLast7Days();
  const startDate = last7Days[0]; // 7 days ago
  const endDate = last7Days[6];   // today
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const { data: completions, error: completionsError } = await supabase
    .from("course_path_section_progress")
    .select("completed_at")
    .eq("clerk_id", userId)
    .eq("completed", true)
    .gte("completed_at", startStr)
    .lte("completed_at", endStr);

  // Build last 7 days array (oldest to newest)
  const week = Array(7).fill(false);
  
  if (completions) {
    completions.forEach((row: { completed_at: string }) => {
      if (!row.completed_at) return;
      const completionDate = new Date(row.completed_at);
      const completionDateStr = completionDate.toISOString().slice(0, 10);
      
      // Find which day in the last 7 days this completion belongs to
      const dayIndex = last7Days.findIndex(day => 
        day.toISOString().slice(0, 10) === completionDateStr
      );
      
      if (dayIndex !== -1) {
        week[dayIndex] = true;
      }
    });
  }

  return NextResponse.json({
    current_streak: streakData?.current_streak || 0,
    longest_streak: streakData?.longest_streak || 0,
    last_completed_date: streakData?.last_completed_date || null,
    week,
  });
} 