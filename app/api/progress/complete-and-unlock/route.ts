// app/api/course/complete-section/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/supabase-client";

export async function POST(request: NextRequest) {
  console.log("=== COMPLETE SECTION API DEBUG ===");

  try {
    const body = await request.json();
    console.log("Request body:", body);

    const { sectionId, courseId, currentOrder } = body;
    // sectionId is actually course_path_section_id
    const course_path_section_id = sectionId;
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

    const supabase = supabaseAdmin;

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

      console.log("Stored completed_at date:", todayStr);
      console.log("Upserted data:", upserted);

      // If the row already existed and was completed before, force update completed_at
      if (
        upserted &&
        upserted.length > 0 &&
        upserted[0].completed &&
        upserted[0].completed_at !== todayStr
      ) {
        await supabase
          .from("course_path_section_progress")
          .update({
            completed_at: todayStr,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_id", userId)
          .eq("course_path_section_id", course_path_section_id);
      }

      console.log("Section marked as completed successfully");

      // Note: Streak calculation is now handled by the /api/streak route
      // which looks at actual completion dates from course_path_section_progress

      // 2. Look up the current section to get order and course_path_id
      const { data: currentSection, error: currentSectionError } =
        await supabase
          .from("course_path_sections")
          .select("id, order, course_path_id")
          .eq("id", course_path_section_id)
          .single();

      if (currentSectionError || !currentSection) {
        console.error("Error fetching current section:", currentSectionError);
        throw currentSectionError || new Error("Current section not found");
      }

      console.log(
        "Current section order:",
        currentSection.order,
        typeof currentSection.order
      );
      const currentOrderNum =
        typeof currentSection.order === "string"
          ? parseInt(currentSection.order, 10)
          : Number(currentSection.order);
      const nextOrder = currentOrderNum + 1;
      console.log(
        "Looking for next section with order:",
        nextOrder,
        typeof nextOrder
      );

      // 3. Find the next section by order+1 and same course_path_id
      const { data: nextSection, error: nextError } = await supabase
        .from("course_path_sections")
        .select("id, order")
        .eq("course_path_id", currentSection.course_path_id)
        .eq('"order"', nextOrder)
        .limit(1)
        .single();

      console.log(
        "Next section query result:",
        nextSection,
        "Error:",
        nextError
      );

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

        console.log(
          "Existing progress for next section:",
          existingProgress,
          "Error:",
          progressError
        );

        if (existingProgress && !progressError) {
          // Update existing progress to unlock the next section
          const { error: unlockError } = await supabase
            .from("course_path_section_progress")
            .update({ unlocked: true, updated_at: new Date().toISOString() })
            .eq("clerk_id", userId)
            .eq("course_path_section_id", nextSection.id);

          if (unlockError) {
            console.error("Error unlocking next section:", unlockError);
            throw unlockError;
          }
          nextSectionUnlocked = true;
          console.log("Next section unlocked (updated existing progress)");
        } else {
          // Create new progress record for the next section
          const { error: createError } = await supabase
            .from("course_path_section_progress")
            .insert([
              {
                clerk_id: userId,
                course_path_section_id: nextSection.id,
                completed: false,
                unlocked: true,
                updated_at: new Date().toISOString(),
              },
            ]);

          if (createError) {
            console.error(
              "Error creating progress for next section:",
              createError
            );
            throw createError;
          }
          nextSectionUnlocked = true;
          console.log("Next section unlocked (created new progress)");
        }
      } else {
        console.log("No next section found or error occurred");
      }

      // 5. Get the next section details for response
      let nextSectionDetails = null;
      if (nextSectionUnlocked && nextSectionId) {
        const { data: nextSectionData, error: nextSectionDataError } =
          await supabase
            .from("course_path_sections")
            .select("id, title, order, course_path_id")
            .eq("id", nextSectionId)
            .single();

        if (!nextSectionDataError && nextSectionData) {
          nextSectionDetails = nextSectionData;
        }
      }

      // 6. Check if this was the last section in the course
      const { data: totalSections, error: totalSectionsError } = await supabase
        .from("course_path_sections")
        .select("id")
        .eq("course_path_id", currentSection.course_path_id);

      if (totalSectionsError) {
        console.error("Error fetching total sections:", totalSectionsError);
      } else {
        console.log("Total sections in course:", totalSections?.length);
      }

      const isLastSection = totalSections
        ? nextOrder > totalSections.length
        : false;

      console.log("=== COMPLETE SECTION API SUCCESS ===");
      return NextResponse.json({
        success: true,
        data: {
          completed: true,
          nextSection: nextSectionDetails,
          isLastSection,
          message: isLastSection
            ? "Course completed!"
            : "Section completed and next section unlocked!",
        },
      });
    } catch (error) {
      console.error("Error in transaction:", error);
      throw error;
    }
  } catch (error) {
    console.error("=== COMPLETE SECTION API ERROR ===", error);
    return NextResponse.json(
      { error: "Failed to complete section" },
      { status: 500 }
    );
  }
}
