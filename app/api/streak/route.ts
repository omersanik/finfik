import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/supabase-client";

function getLast7Days(): Date[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  // --- Fetch or create streak record ---
  const { data: initialStreakData, error: streakError } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_completed_date")
    .eq("clerk_id", userId)
    .single();

  let streakData = initialStreakData;

  if (streakError && streakError.code === "PGRST116") {
    const { data: newStreak } = await supabase
      .from("user_streaks")
      .insert([
        {
          clerk_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
        },
      ])
      .select("current_streak, longest_streak, last_completed_date")
      .single();
    streakData = newStreak;
  } else if (streakError) {
    return NextResponse.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }

  // --- Get completions for last 7 days ---
  const last7Days = getLast7Days();
  const startStr = last7Days[0].toISOString().slice(0, 10);
  const endStr = last7Days[6].toISOString().slice(0, 10);

  const { data: completions } = await supabase
    .from("course_path_section_progress")
    .select("completed_at")
    .eq("clerk_id", userId)
    .eq("completed", true)
    .gte("completed_at", startStr)
    .lte("completed_at", endStr);

  // --- Build week activity (true/false) ---
  const week = Array(7).fill(false);
  const uniqueDates = new Set(
    completions?.map(
      (c) =>
        (c.completed_at.includes("T")
          ? c.completed_at.split("T")[0]
          : c.completed_at) ?? ""
    )
  );

  last7Days.forEach((day, idx) => {
    if (uniqueDates.has(day.toISOString().slice(0, 10))) {
      week[idx] = true;
    }
  });

  // --- Current streak ---
  let currentStreak = 0;
  for (let i = week.length - 1; i >= 0; i--) {
    if (week[i]) currentStreak++;
    else break;
  }

  // --- Last completion date ---
  let lastCompletedDate: string | null = null;
  if (completions?.length) {
    lastCompletedDate =
      completions
        .map((c) =>
          c.completed_at.includes("T")
            ? c.completed_at.split("T")[0]
            : c.completed_at
        )
        .sort()
        .pop() ?? null;
  }

  // --- Longest streak (based on all completions ever) ---
  let longestStreak = streakData?.longest_streak ?? 0;
  const { data: allCompletions } = await supabase
    .from("course_path_section_progress")
    .select("completed_at")
    .eq("clerk_id", userId)
    .eq("completed", true)
    .not("completed_at", "is", null);

  if (allCompletions) {
    const allDates = Array.from(
      new Set(
        allCompletions.map((c) =>
          c.completed_at.includes("T")
            ? c.completed_at.split("T")[0]
            : c.completed_at
        )
      )
    ).sort();

    let maxStreak = 0;
    let current = 0;
    let prev: Date | null = null;

    for (const dateStr of allDates) {
      const d = new Date(dateStr);
      if (prev) {
        const diffDays = (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          current++;
        } else {
          maxStreak = Math.max(maxStreak, current);
          current = 1;
        }
      } else {
        current = 1;
      }
      prev = d;
    }
    maxStreak = Math.max(maxStreak, current);
    longestStreak = Math.max(longestStreak, maxStreak);
  }

  // --- Update streak table ---
  await supabase.from("user_streaks").upsert(
    {
      clerk_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: lastCompletedDate,
    },
    { onConflict: "clerk_id" }
  );

  return NextResponse.json({
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_completed_date: lastCompletedDate,
    week,
  });
}
