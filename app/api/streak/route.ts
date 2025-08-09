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

  if (streakError) {
    console.error(streakError);
    // If user doesn't exist in user_streaks table, create them with default values
    if (streakError.code === 'PGRST116') {
      const { data: newStreakData, error: createError } = await supabase
        .from("user_streaks")
        .insert([{ 
          clerk_id: userId, 
          current_streak: 0, 
          longest_streak: 0, 
          last_completed_date: null 
        }])
        .select("current_streak, longest_streak, last_completed_date")
        .single();
      
      if (createError) {
        console.error("Error creating user streak:", createError);
        return NextResponse.json({ error: "Failed to create user streak" }, { status: 500 });
      }
      
      // Use the newly created streak data
      const streakData = newStreakData;
    } else {
      return NextResponse.json({ error: "Failed to fetch streak data" }, { status: 500 });
    }
  }

  // Get all completed_at dates for the last 7 days
  const last7Days = getLast7Days();
  const startDate = last7Days[0]; // 7 days ago
  const endDate = last7Days[6]; // today
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  console.log("Streak API Debug:", {
    userId,
    last7Days: last7Days.map((d) => d.toISOString().slice(0, 10)),
    startStr,
    endStr,
    streakData,
  });

  const { data: completions, error: completionsError } = await supabase
    .from("course_path_section_progress")
    .select("completed_at")
    .eq("clerk_id", userId)
    .eq("completed", true)
    .gte("completed_at", startStr)
    .lte("completed_at", endStr);

  console.log("Raw completions from DB:", completions);
  console.log(
    "Completions found:",
    completions?.map((c) => c.completed_at)
  );

  // Build last 7 days array (oldest to newest)
  const week = Array(7).fill(false);

  if (completions) {
    console.log("Processing completions:", completions.length, "completions");

    // Create a set of unique completion dates to avoid duplicates
    const uniqueCompletionDates = new Set<string>();

    completions.forEach((row: { completed_at: string }) => {
      if (!row.completed_at) return;

      // Handle both date string and timestamp formats
      let completionDateStr;
      if (row.completed_at.includes("T")) {
        // It's a timestamp, extract date part
        completionDateStr = row.completed_at.split("T")[0];
      } else {
        // It's already a date string
        completionDateStr = row.completed_at;
      }

      uniqueCompletionDates.add(completionDateStr);
      console.log(
        "Added completion date:",
        completionDateStr,
        "from:",
        row.completed_at
      );
    });

    console.log("Unique completion dates:", Array.from(uniqueCompletionDates));

    // Process unique completion dates
    uniqueCompletionDates.forEach((completionDateStr) => {
      // Find which day in the last 7 days this completion belongs to
      const dayIndex = last7Days.findIndex((day) => {
        const dayStr = day.toISOString().slice(0, 10);
        return dayStr === completionDateStr;
      });

      console.log("Day index found:", dayIndex, "for date:", completionDateStr);

      if (dayIndex !== -1) {
        week[dayIndex] = true;
        console.log("Marked day", dayIndex, "as completed");
      }
    });
  }

  console.log("Final week array:", week);
  console.log("Final streak data:", {
    current_streak: streakData?.current_streak || 0,
    longest_streak: streakData?.longest_streak || 0,
    last_completed_date: streakData?.last_completed_date || null,
  });

  // Calculate current streak based on consecutive days
  let currentStreak = 0;
  if (week.length > 0) {
    // Count consecutive days from today backwards
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i]) {
        currentStreak++;
      } else {
        break; // Stop counting when we hit a day without completion
      }
    }
  }

  return NextResponse.json({
    current_streak: currentStreak,
    longest_streak: streakData?.longest_streak || 0,
    last_completed_date: streakData?.last_completed_date || null,
    week,
  });
}
