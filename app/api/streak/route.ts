import { createSupabaseServerClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type CompletionRecord = {
  completed_at: string;
};

function getLast7Days(): Date[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
}

export async function GET() {
  try {
    // Get the current user ID from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create JWT-authenticated Supabase client - user is identified through JWT
    let supabase;
    try {
      supabase = await createSupabaseServerClient();
    } catch (clerkError: unknown) {
      console.error("Clerk JWT error:", clerkError);
      // If this is a new user and JWT is not ready yet, return default streak data
      const isClerkError =
        clerkError &&
        typeof clerkError === "object" &&
        ("status" in clerkError || "clerkError" in clerkError);

      if (isClerkError) {
        console.log(
          "JWT not ready for new user, returning default streak data"
        );
        return NextResponse.json({
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
          week: [false, false, false, false, false, false, false],
        });
      }
      throw clerkError;
    }

    // --- Fetch or create streak record using JWT + explicit user filtering ---
    const { data: initialStreakData, error: streakError } = await supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_completed_date")
      .eq("clerk_id", userId)
      .single();

    let streakData = initialStreakData;

    if (streakError && streakError.code === "PGRST116") {
      // No streak record exists, create one
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
      console.error("Error fetching streak data:", streakError);
      return NextResponse.json(
        { error: "Failed to fetch streak data" },
        { status: 500 }
      );
    }

    // --- Fetch completion data for the last 7 days using explicit user filtering ---
    const { data: completions } = await supabase
      .from("course_path_section_progress")
      .select("completed_at")
      .eq("clerk_id", userId)
      .not("completed_at", "is", null)
      .gte("completed_at", getLast7Days()[0].toISOString());

    // --- Calculate week data ---
    const week = getLast7Days().map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const hasActivity = completions?.some(
        (c: CompletionRecord) =>
          c.completed_at &&
          new Date(c.completed_at).toISOString().split("T")[0] === dateStr
      );
      return hasActivity || false;
    });

    // --- Calculate current and longest streaks ---
    let currentStreak = streakData?.current_streak ?? 0;
    let longestStreak = streakData?.longest_streak ?? 0;

    const { data: allCompletions } = await supabase
      .from("course_path_section_progress")
      .select("completed_at")
      .eq("clerk_id", userId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (allCompletions && allCompletions.length > 0) {
      // Get unique completion dates
      const completionDates = [
        ...new Set(
          allCompletions.map(
            (c: CompletionRecord) =>
              new Date(c.completed_at).toISOString().split("T")[0]
          )
        ),
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      // Calculate current streak
      currentStreak = 0;
      const today = new Date().toISOString().split("T")[0];

      for (let i = 0; i < completionDates.length; i++) {
        const dateStr = completionDates[i] as string;
        const d = new Date(dateStr);
        const diffDays = Math.floor(
          (new Date(today).getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (i === 0 && diffDays <= 1) {
          currentStreak = 1;
        } else if (i > 0) {
          const prevDateStr = completionDates[i - 1] as string;
          const prevDate = new Date(prevDateStr);
          const daysDiff = Math.floor(
            (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Update longest streak if current is higher
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    // --- Update streak data in database ---
    await supabase.from("user_streaks").upsert(
      {
        clerk_id: userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_completed_date: allCompletions?.[0]?.completed_at || null,
      },
      { onConflict: "clerk_id" }
    );

    return NextResponse.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_completed_date: allCompletions?.[0]?.completed_at || null,
      week,
    });
  } catch (error) {
    console.error("Streak API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
