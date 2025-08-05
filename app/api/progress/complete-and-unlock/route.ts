// app/api/course/complete-section/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(request: NextRequest) {
  console.log("=== COMPLETE SECTION API DEBUG ===");

  try {
    const body = await request.json();
    console.log("Request body:", body);

    const { sectionId, courseId, currentOrder } = body;
    // sectionId is actually course_path_section_id
    const course_path_section_id = sectionId;
    const course_path_id = courseId;
    console.log("Extracted values:", { sectionId, courseId, currentOrder });

    const { userId } = await auth();
    console.log("User ID:", userId);

    if (!userId) {
      console.log("No user ID found - unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate required fields
    if (!sectionId || !courseId || currentOrder === undefined) {
      console.log("Missing required fields:", {
        sectionId,
        courseId,
        currentOrder,
      });
      return NextResponse.json(
        { error: "Missing required fields: sectionId, courseId, currentOrder" },
        { status: 400 }
      );
    }

    const supabase = CreateSupabaseClient();

    // Start transaction-like operations
    try {
      // 1. Get today's date in UTC (YYYY-MM-DD)
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      // 1. Mark the current section as completed
      console.log("Marking current section as completed...");
      // Always update completed_at to todayStr
      const { data: upserted, error: updateError } = await supabase
        .from("course_path_section_progress")
        .upsert(
          [
            {
              clerk_id: userId,
              course_path_section_id: course_path_section_id,
              completed: true,
              unlocked: true,
              completed_at: todayStr,
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "clerk_id,course_path_section_id" }
        )
        .select();
      if (updateError) {
        console.error("Error marking section as completed:", updateError);
        throw updateError;
      }
      
      console.log('Stored completed_at date:', todayStr);
      console.log('Upserted data:', upserted);
      
      // If the row already existed and was completed before, force update completed_at
      if (upserted && upserted.length > 0 && upserted[0].completed && upserted[0].completed_at !== todayStr) {
        await supabase
          .from("course_path_section_progress")
          .update({ completed_at: todayStr, updated_at: new Date().toISOString() })
          .eq("clerk_id", userId)
          .eq("course_path_section_id", course_path_section_id);
      }

      console.log("Section marked as completed successfully");

      // === Streak logic ===
      // 2. Get yesterday's date in UTC (YYYY-MM-DD)
      const yesterday = new Date(today);
      yesterday.setUTCDate(today.getUTCDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      console.log('Streak Debug - Dates:', {
        today: todayStr,
        yesterday: yesterdayStr,
        userId
      });

      // 3. Fetch current streak info
      let streakRow = null;
      {
        const { data, error } = await supabase
          .from("user_streaks")
          .select("current_streak, last_completed_date, longest_streak")
          .eq("clerk_id", userId)
          .single();
        if (!error && data) streakRow = data;
      }

      console.log('Streak Debug - Current streak data:', streakRow);

      let newStreak = 1;
      let newLongest = 1;
      
      if (streakRow) {
        if (streakRow.last_completed_date === todayStr) {
          // Already completed something today, don't change streak count
          newStreak = streakRow.current_streak;
          newLongest = streakRow.longest_streak;
          console.log('Streak Debug - Already completed today, no change to streak count');
        } else if (streakRow.last_completed_date === yesterdayStr) {
          // Continue streak
          newStreak = streakRow.current_streak + 1;
          newLongest = Math.max(newStreak, streakRow.longest_streak);
          console.log('Streak Debug - Continuing streak:', { oldStreak: streakRow.current_streak, newStreak });
        } else {
          // Reset streak
          newStreak = 1;
          newLongest = Math.max(1, streakRow.longest_streak);
          console.log('Streak Debug - Resetting streak to 1');
        }
      } else {
        console.log('Streak Debug - No existing streak, starting at 1');
      }

      // 4. Always update streak row with current date
      const { error: streakError } = await supabase
        .from("user_streaks")
        .upsert({
          clerk_id: userId,
          current_streak: newStreak,
          last_completed_date: todayStr,
          longest_streak: newLongest,
        }, { onConflict: "clerk_id" });
      if (streakError) {
        console.error("Error updating streak:", streakError);
      } else {
        console.log('Streak Debug - Updated streak successfully:', { newStreak, newLongest, lastCompletedDate: todayStr });
      }
      // === End streak logic ===

      // 2. Look up the current section to get order and course_path_id
      const { data: currentSection, error: currentSectionError } = await supabase
        .from("course_path_sections")
        .select("id, order, course_path_id")
        .eq("id", course_path_section_id)
        .single();

      if (currentSectionError || !currentSection) {
        console.error("Error fetching current section:", currentSectionError);
        throw currentSectionError || new Error("Current section not found");
      }

      console.log("Current section order:", currentSection.order, typeof currentSection.order);
      const currentOrderNum = typeof currentSection.order === 'string'
        ? parseInt(currentSection.order, 10)
        : Number(currentSection.order);
      const nextOrder = currentOrderNum + 1;
      console.log("Looking for next section with order:", nextOrder, typeof nextOrder);

      // 3. Find the next section by order+1 and same course_path_id
      const { data: nextSection, error: nextError } = await supabase
        .from("course_path_sections")
        .select("id, order")
        .eq("course_path_id", currentSection.course_path_id)
        .eq('"order"', nextOrder)
        .limit(1)
        .single();

      console.log("Next section query result:", nextSection, "Error:", nextError);

      let nextSectionUnlocked = false;
      let nextSectionId = null;

      if (nextSection && !nextError) {
        nextSectionId = nextSection.id;
        console.log("Next section found. ID:", nextSectionId);
        // 4. Check if progress record exists for the next section
        const { data: existingProgress, error: progressError } = await supabase
          .from("course_path_section_progress")
          .select("*")
          .eq("clerk_id", userId)
          .eq("course_path_section_id", nextSection.id)
          .single();

        console.log("Existing progress for next section:", existingProgress, "Error:", progressError);

        if (existingProgress && !progressError) {
          // Update existing progress to unlock the next section
          const { error: unlockError } = await supabase
            .from("course_path_section_progress")
            .update({
              unlocked: true,
              updated_at: new Date().toISOString(),
            })
            .eq("clerk_id", userId)
            .eq("course_path_section_id", nextSection.id);

          console.log("Update result for next section unlock. Error:", unlockError);

          if (unlockError) {
            console.error("Error unlocking next section:", unlockError);
            throw unlockError;
          }

          nextSectionUnlocked = true;
        } else {
          // Create new progress record for the next section
          const { error: insertError } = await supabase
            .from("course_path_section_progress")
            .insert([
              {
                clerk_id: userId,
                course_path_section_id: nextSection.id,
                unlocked: true,
                completed: false,
                quiz_passed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          console.log("Insert result for next section unlock. Error:", insertError);

          if (insertError) {
            console.error("Error creating next section progress:", insertError);
            throw insertError;
          }

          nextSectionUnlocked = true;
        }
      } else {
        console.log("No next section found - course completed");
      }

      const result = {
        currentSectionCompleted: true,
        nextSectionUnlocked,
        nextSectionId,
      };

      console.log("Operation completed successfully:", result);

      return NextResponse.json({
        success: true,
        message: nextSectionUnlocked
          ? "Section completed successfully and next section unlocked"
          : "Section completed successfully - course finished",
        data: result,
      });
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      throw dbError;
    }
  } catch (err) {
    console.error("Section completion error:", err);

    // Provide more detailed error information
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorDetails = err instanceof Error ? err.stack : undefined;

    console.error("Error details:", errorDetails);

    return NextResponse.json(
      {
        error: "Failed to complete section",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
//   </div>
