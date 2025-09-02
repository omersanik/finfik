import { supabaseAdmin } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("Premium users API called with userId:", userId);

    if (!userId) {
      console.log("No userId found, returning unauthorized");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = supabaseAdmin;

    // First, let's see what columns exist in the users table
    console.log("Querying users table for clerk_id:", userId);

    // Let's also check ALL columns to see what's actually there
    const { data: allUserData, error: allUserError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    console.log("ALL user data:", allUserData);
    console.log("ALL user error:", allUserError);

    if (allUserData) {
      console.log("All user columns:", Object.keys(allUserData));
      console.log(
        "subscription_plan from all data:",
        allUserData.subscription_plan
      );
      console.log(
        "subscription_plan type from all data:",
        typeof allUserData.subscription_plan
      );
    }

    // Check for multiple records first
    const { data: allUsers, error: checkError } = await supabase
      .from("users")
      .select("is_premium, subscription_plan, role, id, created_at")
      .eq("clerk_id", userId);

    if (checkError) {
      console.error("Error checking for duplicate users:", checkError);
      return new Response(JSON.stringify({ error: checkError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let user = null;
    const error = null;

    if (allUsers && allUsers.length > 1) {
      console.warn(
        `🚨 FOUND ${allUsers.length} USER RECORDS FOR ${userId}:`,
        allUsers
      );
      // For now, use the most recently created record with the highest role priority
      const rolePriority: Record<string, number> = {
        admin: 4,
        premium: 3,
        beta: 2,
        user: 1,
      };
      user = allUsers.sort((a, b) => {
        const priorityDiff =
          (rolePriority[b.role] || 0) - (rolePriority[a.role] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })[0];
      console.log(
        `Selected user record with role '${user.role}' (highest priority)`
      );
    } else if (allUsers && allUsers.length === 1) {
      user = allUsers[0];
    }

    console.log("Database query result:", { user, error });

    // Let's also check what the raw data looks like
    if (user) {
      console.log("Raw user data:", user);
      console.log("User keys:", Object.keys(user));
      console.log("subscription_plan value:", user.subscription_plan);
      console.log("subscription_plan type:", typeof user.subscription_plan);
      console.log("role value:", user.role);
    }

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user) {
      console.log("No user found in database");
      return new Response(
        JSON.stringify({ is_premium: false, subscription_plan: null }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Check if user has premium access (either is_premium=true OR role='beta')
    const hasPremiumAccess = user.is_premium === true || user.role === "beta";
    console.log(
      `User premium access: ${hasPremiumAccess} (is_premium: ${user.is_premium}, role: ${user.role})`
    );

    return new Response(
      JSON.stringify({
        is_premium: hasPremiumAccess,
        subscription_plan: user.subscription_plan,
        role: user.role,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Premium users GET API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = supabaseAdmin;
    const body = await req.json();
    const { is_premium } = body;

    if (typeof is_premium !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid is_premium value" }),
        { status: 400 }
      );
    }

    // If premium status is being revoked, clean up all premium course access
    if (is_premium === false) {
      console.log(`Revoking premium access for user: ${userId}`);

      try {
        // Find all premium course IDs
        const { data: premiumCourses, error: premiumError } = await supabase
          .from("courses")
          .select("id")
          .eq("is_premium_course", true);

        if (premiumError) {
          console.error("Error fetching premium courses:", premiumError);
          return new Response(JSON.stringify({ error: premiumError.message }), {
            status: 500,
          });
        }

        const premiumCourseIds = (premiumCourses || []).map((c) => c.id);
        console.log(
          `Found ${premiumCourseIds.length} premium courses to clean up`
        );

        if (premiumCourseIds.length > 0) {
          // 1. Remove enrollments for premium courses
          const { error: enrollmentError } = await supabase
            .from("course_enrollments")
            .delete()
            .eq("clerk_id", userId)
            .in("course_id", premiumCourseIds);

          if (enrollmentError) {
            console.error(
              "Error removing course enrollments:",
              enrollmentError
            );
          } else {
            console.log("Removed course enrollments for premium courses");
          }

          // 2. Remove progress for premium courses
          // First, get all course_path_section ids for premium courses
          const { data: coursePaths, error: pathError } = await supabase
            .from("course_path")
            .select("id, course_id")
            .in("course_id", premiumCourseIds);

          if (!pathError && coursePaths && coursePaths.length > 0) {
            const coursePathIds = coursePaths.map((p) => p.id);
            console.log(
              `Found ${coursePathIds.length} course paths to clean up`
            );

            const { data: sectionIds, error: sectionError } = await supabase
              .from("course_path_sections")
              .select("id, course_path_id")
              .in("course_path_id", coursePathIds);

            if (!sectionError && sectionIds && sectionIds.length > 0) {
              const sectionIdList = sectionIds.map((s) => s.id);
              console.log(
                `Found ${sectionIdList.length} course sections to clean up`
              );

              // Remove progress for all premium course sections
              const { error: progressError } = await supabase
                .from("course_path_section_progress")
                .delete()
                .eq("clerk_id", userId)
                .in("course_path_section_id", sectionIdList);

              if (progressError) {
                console.error("Error removing course progress:", progressError);
              } else {
                console.log("Removed course progress for premium courses");
              }
            }
          }

          // 3. Remove any other premium-related data
          // Remove from user_streaks if they only had premium course progress
          const { data: remainingProgress, error: remainingError } =
            await supabase
              .from("course_path_section_progress")
              .select("id")
              .eq("clerk_id", userId)
              .limit(1);

          if (
            !remainingError &&
            (!remainingProgress || remainingProgress.length === 0)
          ) {
            // No remaining progress, remove streak data
            const { error: streakError } = await supabase
              .from("user_streaks")
              .delete()
              .eq("clerk_id", userId);

            if (streakError) {
              console.error("Error removing user streaks:", streakError);
            } else {
              console.log("Removed user streak data (no remaining progress)");
            }
          }
        }

        // 4. Update user status
        const { error: updateError } = await supabase
          .from("users")
          .update({
            is_premium: false,
            subscription_id: null,
            subscription_plan: null,
          })
          .eq("clerk_id", userId);

        if (updateError) {
          console.error("Error updating user status:", updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
          });
        }

        console.log(`Successfully revoked premium access for user: ${userId}`);
        return new Response(
          JSON.stringify({
            success: true,
            message:
              "Premium access revoked and all premium course data cleaned up",
          }),
          { status: 200 }
        );
      } catch (error) {
        console.error("Error during premium cleanup:", error);
        return new Response(
          JSON.stringify({ error: "Failed to clean up premium access" }),
          { status: 500 }
        );
      }
    }

    // If premium status is being granted, just update the status
    if (is_premium === true) {
      const { error } = await supabase
        .from("users")
        .update({ is_premium: true })
        .eq("clerk_id", userId);

      if (error) {
        console.error("Error granting premium access:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }

      console.log(`Successfully granted premium access for user: ${userId}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Premium access granted",
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid premium status value" }),
      { status: 400 }
    );
  } catch (error) {
    console.error("Premium users PATCH API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
