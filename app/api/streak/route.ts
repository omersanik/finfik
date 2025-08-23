import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/supabase-client";

function getLast7Days() {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i); // Use local date instead of UTC
    last7Days.push(date);
  }

  return last7Days;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = await createSupabaseServerClient();

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

  // Calculate current streak based on consecutive days
  let currentStreak = 0;
  
  // The streak should count consecutive days from today backwards
  // until we hit a day without completion
  if (week.length > 0) {
    // Start from today (last day in the array) and count backwards
    for (let i = week.length - 1; i >= 0; i--) {
      if (week[i]) {
        // This day has a completion, increment streak
        currentStreak++;
        console.log(`Day ${i} completed, streak now: ${currentStreak}`);
      } else {
        // This day has no completion, streak breaks here
        console.log(`Day ${i} missed, streak breaks at ${currentStreak}`);
        break;
      }
    }
  }
  
  console.log("Final current streak:", currentStreak);

  // Get the most recent completion date
  let lastCompletedDate = null;
  if (completions && completions.length > 0) {
    // Sort completions by date and get the most recent
    const sortedCompletions = completions
      .filter(c => c.completed_at)
      .sort((a, b) => {
        const dateA = a.completed_at.includes("T") ? a.completed_at.split("T")[0] : a.completed_at;
        const dateB = b.completed_at.includes("T") ? b.completed_at.split("T")[0] : b.completed_at;
        return dateB.localeCompare(dateA);
      });
    
    if (sortedCompletions.length > 0) {
      const mostRecent = sortedCompletions[0].completed_at;
      lastCompletedDate = mostRecent.includes("T") ? mostRecent.split("T")[0] : mostRecent;
    }
  }

  // Calculate longest streak by looking at all completion dates
  const { data: allCompletions, error: allCompletionsError } = await supabase
    .from("course_path_section_progress")
    .select("completed_at")
    .eq("clerk_id", userId)
    .eq("completed", true)
    .not("completed_at", "is", null);

  let longestStreak = streakData?.longest_streak || 0;
  
  if (allCompletions && !allCompletionsError) {
    // Get all unique completion dates
    const allCompletionDates = new Set<string>();
    allCompletions.forEach((row: { completed_at: string }) => {
      if (row.completed_at) {
        const dateStr = row.completed_at.includes("T") ? row.completed_at.split("T")[0] : row.completed_at;
        allCompletionDates.add(dateStr);
      }
    });

    // Convert to sorted array
    const sortedDates = Array.from(allCompletionDates).sort();
    
    // Calculate longest consecutive streak
    let maxStreak = 0;
    let currentConsecutive = 0;
    let prevDate = null;

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr);
      
      if (prevDate === null) {
        currentConsecutive = 1;
      } else {
        const prevDateObj = new Date(prevDate);
        const diffTime = currentDate.getTime() - prevDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentConsecutive++;
        } else {
          maxStreak = Math.max(maxStreak, currentConsecutive);
          currentConsecutive = 1;
        }
      }
      
      prevDate = dateStr;
    }
    
    // Check the last streak
    maxStreak = Math.max(maxStreak, currentConsecutive);
    longestStreak = Math.max(longestStreak, maxStreak);
  }

  // Update the user_streaks table with the calculated values
  const { error: updateError } = await supabase
    .from("user_streaks")
    .upsert({
      clerk_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: lastCompletedDate,
    }, { onConflict: "clerk_id" });

  if (updateError) {
    console.error("Error updating user_streaks:", updateError);
  }

  console.log("Final streak data:", {
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_completed_date: lastCompletedDate,
  });

  return NextResponse.json({
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_completed_date: lastCompletedDate,
    week,
  });
}
