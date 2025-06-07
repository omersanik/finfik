"use server";

import { CreateSupabaseClient } from "@/supabase-client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
// Existing functions (keeping them as they are)

export const getAllCourses = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();
  const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    console.error("Error fetching courses:", error.message);
  }

  console.log("Fetched courses:", data);
  return data;
};

export const fetchCourse = async (slug: string) => {
  const supabase = CreateSupabaseClient();
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course || courseError) {
    throw new Error("Course not found!");
  }
  return course;
};

// Fixed ensureUserExists function with proper conflict resolution
export async function ensureUserExists(userId: string, clerkId: string) {
  const supabase = CreateSupabaseClient();
  if (!userId) {
    throw new Error("Clerk user ID is missing");
  }

  // Get the current user's data from Clerk
  const user = await currentUser();

  if (!user) {
    throw new Error("Could not fetch user data from Clerk");
  }

  // Extract user information
  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.username || "Unknown User";

  const email = user.emailAddresses[0]?.emailAddress || null;

  // First, try to find existing user by clerk_id or email
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, clerk_id, email")
    .or(`clerk_id.eq.${clerkId},email.eq.${email}`)
    .single();

  if (existingUser) {
    // User exists, update their info if needed
    const { error } = await supabase
      .from("users")
      .update({
        clerk_id: clerkId,
        name: name,
        email: email,
      })
      .eq("id", existingUser.id);

    if (error) {
      console.error("❌ Error updating existing user:", error);
      throw new Error("User update failed");
    }

    console.log("✅ Updated existing user:", existingUser.id);
    return existingUser.id;
  } else {
    // User doesn't exist, create new one
    const { error, data } = await supabase
      .from("users")
      .insert({
        id: userId,
        clerk_id: clerkId,
        name: name,
        email: email,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating new user:", error);
      throw new Error("User creation failed");
    }

    console.log("✅ Created new user:", data);
    return data.id;
  }
}

// Fixed simplified version with better conflict handling
export async function ensureUserExistsSimplified() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("Could not fetch user data from Clerk");
  }

  const supabase = CreateSupabaseClient();

  // Extract user information
  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.username || "Unknown User";

  const email = user.emailAddresses[0]?.emailAddress || null;

  try {
    // First, check if user already exists by clerk_id
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id, clerk_id, email")
      .eq("clerk_id", userId)
      .single();

    if (existingUser) {
      // User exists, update their info if email has changed
      if (existingUser.email !== email) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: name,
            email: email,
          })
          .eq("id", existingUser.id);

        if (updateError) {
          console.error("❌ Error updating user email:", updateError);
          // Don't throw here, just log the error and continue
        } else {
          console.log("✅ Updated user email:", existingUser.id);
        }
      }

      console.log("✅ User exists:", existingUser.id);
      return userId;
    }
  } catch (error) {
    // User doesn't exist, we'll create them below
    console.log("User not found, will create new user");
  }

  try {
    // Try to create new user
    const { error, data } = await supabase
      .from("users")
      .insert({
        id: userId,
        clerk_id: userId,
        name: name,
        email: email,
      })
      .select()
      .single();

    if (error) {
      // If it's a duplicate email error, try to handle it gracefully
      if (error.code === "23505" && error.message.includes("email")) {
        console.log("Email already exists, attempting to link accounts...");

        // Find the user with this email and update their clerk_id
        const { data: emailUser, error: emailError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (emailUser && !emailError) {
          const { error: linkError } = await supabase
            .from("users")
            .update({
              clerk_id: userId,
              name: name,
            })
            .eq("id", emailUser.id);

          if (linkError) {
            console.error("❌ Error linking accounts:", linkError);
            throw new Error("Account linking failed");
          }

          console.log("✅ Linked existing email account to Clerk user");
          return userId;
        }
      }

      console.error(
        "❌ Supabase error during user creation:",
        JSON.stringify(error, null, 2)
      );
      throw new Error("User creation failed");
    }

    console.log("✅ User created successfully:", data);
    return userId;
  } catch (insertError) {
    console.error("❌ Failed to create user:", insertError);
    throw new Error("User creation/upsert failed");
  }
}

// Alternative version using proper upsert with multiple conflict columns
export async function ensureUserExistsWithUpsert() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("Could not fetch user data from Clerk");
  }

  const supabase = CreateSupabaseClient();

  // Extract user information
  const name =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.username || "Unknown User";

  const email = user.emailAddresses[0]?.emailAddress || null;

  // Use upsert with proper conflict resolution
  // Note: This assumes your users table has both id and email as unique constraints
  const { error, data } = await supabase
    .from("users")
    .upsert(
      {
        id: userId,
        clerk_id: userId,
        name: name,
        email: email,
      },
      {
        onConflict: "clerk_id", // Use clerk_id as the conflict resolution field
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error(
      "❌ Supabase error during upsert:",
      JSON.stringify(error, null, 2)
    );
    throw new Error("User creation/upsert failed");
  }

  console.log("✅ User exists or was created:", data);
  return userId;
}

// FIXED: Helper function to initialize user progress for a course
// FIXED: Helper function to initialize user progress for a course
const initializeUserProgress = async (userId: string, courseId: string) => {
  // Use the simplified version that handles user data internally
  await ensureUserExistsSimplified();

  console.log("🔧 Initializing user progress for:", { userId, courseId });
  const supabase = CreateSupabaseClient();

  // Rest of your existing code remains the same...
  // Get course path
  const { data: coursePath, error: coursePathError } = await supabase
    .from("course_path")
    .select("id")
    .eq("course_id", courseId)
    .single();

  if (coursePathError || !coursePath) {
    console.error("Course path not found for initialization");
    return;
  }

  // Get all sections for this course
  const { data: sections, error: sectionsError } = await supabase
    .from("course_path_sections")
    .select("id, order")
    .eq("course_path_id", coursePath.id)
    .order("order", { ascending: true });

  if (sectionsError || !sections || sections.length === 0) {
    console.error("Sections not found for initialization");
    return;
  }

  // Check if user already has progress records for this course
  const { data: existingProgress, error: progressCheckError } = await supabase
    .from("course_path_section_progress")
    .select("course_path_section_id")
    .eq("user_id", userId)
    .in(
      "course_path_section_id",
      sections.map((s) => s.id)
    );

  if (progressCheckError) {
    console.error("Error checking existing progress:", progressCheckError);
    return;
  }

  // Find the minimum order (should be 0 or 1)
  const minOrder = Math.min(...sections.map((s) => s.order));
  console.log("📊 Minimum section order:", minOrder);

  // If user has no progress at all for this course, create progress for all sections
  if (!existingProgress || existingProgress.length === 0) {
    console.log("🆕 Creating initial progress records for user");

    const progressRecords = sections.map((section) => ({
      user_id: userId,
      course_path_section_id: section.id,
      unlocked: section.order === minOrder, // First section (minimum order) is unlocked initially
      completed: false,
      quiz_passed: false,
    }));

    const { error: insertError } = await supabase
      .from("course_path_section_progress")
      .insert(progressRecords);

    if (insertError) {
      console.error("Error initializing user progress:", insertError);
    } else {
      console.log(
        "✅ Initialized progress for all sections, first section unlocked"
      );
    }
  } else {
    console.log(
      "📋 User already has progress records, checking for missing sections"
    );

    // Check if there are missing sections and add them
    const existingIds = existingProgress.map((p) => p.course_path_section_id);
    const sectionsToCreate = sections.filter(
      (s) => !existingIds.includes(s.id)
    );

    if (sectionsToCreate.length > 0) {
      console.log(
        `➕ Adding ${sectionsToCreate.length} missing progress records`
      );

      // For missing sections, determine if they should be unlocked based on current progress
      const { data: userProgressData } = await supabase
        .from("course_path_section_progress")
        .select("course_path_section_id, completed, unlocked")
        .eq("user_id", userId)
        .in("course_path_section_id", existingIds);

      // Find the highest order completed section
      let highestCompletedOrder = -1;
      for (const section of sections) {
        const progress = userProgressData?.find(
          (p) => p.course_path_section_id === section.id
        );
        if (progress?.completed && section.order > highestCompletedOrder) {
          highestCompletedOrder = section.order;
        }
      }

      const progressRecords = sectionsToCreate.map((section) => ({
        user_id: userId,
        course_path_section_id: section.id,
        unlocked:
          section.order === minOrder ||
          section.order <= highestCompletedOrder + 1,
        completed: false,
        quiz_passed: false,
      }));

      const { error: insertError } = await supabase
        .from("course_path_section_progress")
        .insert(progressRecords);

      if (insertError) {
        console.error("Error adding missing progress records:", insertError);
      } else {
        console.log("✅ Added missing progress records");
      }
    } else {
      console.log("✅ All progress records exist for this user");
    }
  }
};
export const fetchCoursePath = async (slug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();

  console.log("📦 Slug received:", slug);
  console.log("👤 User ID:", userId);

  const { data: courses, error: courseError } = await supabase
    .from("courses")
    .select("id, slug");

  if (courseError) {
    console.error("Error fetching courses:", courseError.message);
    throw new Error("Error fetching courses.");
  }

  const course = courses?.find((c) => c.slug === slug);

  if (!course) {
    console.error("❌ Course not found for slug:", slug);
    throw new Error(`Course not found! Slug: ${slug}`);
  }

  console.log("🎯 Found course:", course);

  // Initialize user progress if needed
  await initializeUserProgress(userId, course.id);

  const { data: coursePath, error: coursePathError } = await supabase
    .from("course_path")
    .select(
      `
      id,
      name,
      course_path_sections(
        id,
        title,
        order,
        description,
        lessons
      )           
    `
    )
    .eq("course_id", course.id)
    .single();

  if (coursePathError || !coursePath) {
    console.error("❌ Course path fetch error:", coursePathError?.message);
    throw new Error("Course path not found!");
  }

  // Get user progress for all sections - ONLY for this specific user
  const sectionIds = coursePath.course_path_sections.map((s) => s.id);
  const { data: userProgress, error: progressError } = await supabase
    .from("course_path_section_progress")
    .select("course_path_section_id, unlocked, completed, quiz_passed")
    .eq("user_id", userId) // This ensures we only get THIS user's progress
    .in("course_path_section_id", sectionIds);

  if (progressError) {
    console.error("Error fetching user progress:", progressError);
  }

  console.log("👤 User progress data:", userProgress);

  // Merge progress data with sections
  const sectionsWithProgress = coursePath.course_path_sections.map(
    (section) => {
      const progress = userProgress?.find(
        (p) => p.course_path_section_id === section.id
      );

      const sectionWithProgress = {
        ...section,
        completed: progress?.completed || false,
        unlocked: progress?.unlocked || false,
        quiz_passed: progress?.quiz_passed || false,
      };

      console.log(`📄 Section ${section.order}: ${section.title}`, {
        unlocked: sectionWithProgress.unlocked,
        completed: sectionWithProgress.completed,
      });

      return sectionWithProgress;
    }
  );

  const sortedSections = sectionsWithProgress.sort((a, b) => a.order - b.order);

  return {
    pathId: coursePath.id,
    pathName: coursePath.name,
    sections: sortedSections,
  };
};

export const getCourseContent = async (slug: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();

  // Step 1: Get course by slug
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    console.error("❌ Course not found for slug:", slug);
    throw new Error("Course not found.");
  }

  // Initialize user progress if needed
  await initializeUserProgress(userId, course.id);

  // Step 2: Get course path with sections
  const { data: coursePath, error: coursePathError } = await supabase
    .from("course_path")
    .select(
      `
      id,
      name,
      course_path_sections (
        id,
        title,
        order,
        description
      )
    `
    )
    .eq("course_id", course.id)
    .single();

  if (coursePathError || !coursePath) {
    console.error("❌ Failed to fetch course path:", coursePathError?.message);
    throw new Error("Course path not found.");
  }

  // Get user progress for all sections - ONLY for this specific user
  const sectionIds = coursePath.course_path_sections.map((s) => s.id);
  const { data: userProgress, error: progressError } = await supabase
    .from("course_path_section_progress")
    .select("course_path_section_id, unlocked, completed, quiz_passed")
    .eq("user_id", userId) // This ensures we only get THIS user's progress
    .in("course_path_section_id", sectionIds);

  if (progressError) {
    console.error("Error fetching user progress:", progressError);
  }

  console.log("👤 User progress for content:", userProgress);

  // Step 3: Sort sections by order and merge with progress
  const sectionsWithProgress = coursePath.course_path_sections.map(
    (section) => {
      const progress = userProgress?.find(
        (p) => p.course_path_section_id === section.id
      );

      const sectionWithProgress = {
        ...section,
        completed: progress?.completed || false,
        unlocked: progress?.unlocked || false,
        quiz_passed: progress?.quiz_passed || false,
      };

      console.log(`📄 Content Section ${section.order}: ${section.title}`, {
        unlocked: sectionWithProgress.unlocked,
        completed: sectionWithProgress.completed,
      });

      return sectionWithProgress;
    }
  );

  const sortedSections = sectionsWithProgress.sort((a, b) => a.order - b.order);

  // Step 4: Fetch content blocks and nested content items for each section
  const { data: contentBlocks, error: blocksError } = await supabase
    .from("content_block")
    .select(
      `
      id,
      section_id,
      title,
      order_index,
      content_item (
        id,
        type,
        content_text,
        image_url,
        quiz_data,
        component_key,
        order_index
      )
    `
    )
    .in("section_id", sectionIds);

  if (blocksError) {
    console.error("❌ Error fetching content blocks:", blocksError.message);
    throw new Error("Could not fetch content blocks.");
  }

  // Group content blocks by section
  const blocksBySection = sectionIds.map((sectionId) => ({
    sectionId,
    blocks: contentBlocks
      .filter((block) => block.section_id === sectionId)
      .sort((a, b) => a.order_index - b.order_index)
      .map((block) => ({
        ...block,
        content_item: block.content_item.sort(
          (a, b) => a.order_index - b.order_index
        ),
      })),
  }));

  return {
    course: {
      id: course.id,
      slug: course.slug,
    },
    path: {
      id: coursePath.id,
      name: coursePath.name,
      sections: sortedSections.map((section) => ({
        ...section,
        blocks:
          blocksBySection.find((b) => b.sectionId === section.id)?.blocks || [],
      })),
    },
  };
};

// FIXED: Server action for updating section progress
export async function updateSectionProgress(
  sectionId: string,
  completed: boolean
) {
  try {
    console.log("Server Action: updateSectionProgress called", {
      sectionId,
      completed,
    });

    const { userId } = await auth();
    if (!userId) {
      console.log("Server Action: No user ID found");
      throw new Error("Unauthorized");
    }

    if (!sectionId || typeof completed !== "boolean") {
      console.log("Server Action: Invalid parameters:", {
        sectionId,
        completed,
      });
      throw new Error("Invalid parameters");
    }

    const supabase = CreateSupabaseClient();

    const updateData: any = { completed };
    if (completed) {
      updateData.completed_at = new Date().toISOString();
    }

    // Update progress for THIS specific user only
    const { data, error } = await supabase
      .from("course_path_section_progress")
      .update(updateData)
      .eq("user_id", userId) // Ensures only this user's progress is updated
      .eq("course_path_section_id", sectionId)
      .select();

    if (error) {
      console.error("Server Action: Supabase error:", error);
      throw new Error(`Failed to update progress: ${error.message}`);
    }

    console.log("Server Action: Success:", data);

    // Revalidate the course page to reflect changes
    revalidatePath("/courses/[slug]/[courseId]", "page");

    return {
      success: true,
      data,
      message: `Section ${completed ? "completed" : "reset"}`,
    };
  } catch (error) {
    console.error("Server Action: Unexpected error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

// FIXED: Server action specifically for completing a section and unlocking next
export async function completeSectionAndUnlockNext(
  sectionId: string,
  courseId: string,
  currentSectionOrder: number
) {
  try {
    console.log("Server Action: completeSectionAndUnlockNext called", {
      sectionId,
      courseId,
      currentSectionOrder,
    });

    const { userId } = await auth();
    if (!userId) {
      console.log("Server Action: No user ID found");
      throw new Error("Unauthorized");
    }

    if (!sectionId || !courseId || typeof currentSectionOrder !== "number") {
      console.log("Server Action: Invalid parameters:", {
        sectionId,
        courseId,
        currentSectionOrder,
      });
      throw new Error("Invalid parameters");
    }

    const supabase = CreateSupabaseClient();

    // Step 1: Mark current section as completed for THIS user
    const { data: completedSection, error: completeError } = await supabase
      .from("course_path_section_progress")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId) // Ensures only this user's progress is updated
      .eq("course_path_section_id", sectionId)
      .select();

    if (completeError) {
      console.error("Server Action: Error completing section:", completeError);
      throw new Error(`Failed to complete section: ${completeError.message}`);
    }

    console.log(
      "✅ Server Action: Section completed for user:",
      completedSection
    );

    // Step 2: Unlock next section for THIS user
    const unlockResult = await unlockNextSection(courseId, currentSectionOrder);

    // Revalidate the course page to reflect changes
    revalidatePath("/courses/[slug]/[courseId]", "page");

    return {
      success: true,
      completedSection,
      unlockResult,
      message: "Section completed and next section unlocked",
    };
  } catch (error) {
    console.error("Server Action: Unexpected error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

// FIXED: Unlock next section for specific user
export async function unlockNextSection(
  courseId: string,
  currentSectionOrder: number
) {
  try {
    console.log("Server Action: unlockNextSection called", {
      courseId,
      currentSectionOrder,
    });

    const { userId } = await auth();
    if (!userId) {
      console.log("Server Action: No user ID found");
      throw new Error("Unauthorized");
    }

    if (!courseId || typeof currentSectionOrder !== "number") {
      console.log("Server Action: Invalid parameters:", {
        courseId,
        currentSectionOrder,
      });
      throw new Error("Invalid parameters");
    }

    const supabase = CreateSupabaseClient();

    // Get the course path for this course
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", courseId)
      .single();

    if (coursePathError || !coursePath) {
      console.error("Server Action: Course path error:", coursePathError);
      throw new Error(
        `Course path not found: ${coursePathError?.message || "Unknown error"}`
      );
    }

    console.log("Found course path:", coursePath);

    // Get all sections for this course path to find the next one
    const { data: allSections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select('id, "order"')
      .eq("course_path_id", coursePath.id)
      .order('"order"', { ascending: true });

    if (sectionsError) {
      console.error("Server Action: Error fetching sections:", sectionsError);
      throw new Error(`Error fetching sections: ${sectionsError.message}`);
    }

    // Find the next section
    const nextSection = allSections?.find(
      (section) => section.order === currentSectionOrder + 1
    );

    if (!nextSection) {
      console.log("Server Action: No next section found");
      return {
        success: true,
        data: null,
        message: "No next section to unlock - course completed",
      };
    }

    // Check if next section is already unlocked for THIS user
    const { data: existingProgress } = await supabase
      .from("course_path_section_progress")
      .select("unlocked")
      .eq("user_id", userId) // Check for THIS user only
      .eq("course_path_section_id", nextSection.id)
      .single();

    if (existingProgress?.unlocked) {
      console.log("Server Action: Next section already unlocked for this user");
      return {
        success: true,
        data: nextSection,
        message: "Next section already unlocked",
      };
    }

    // Unlock the next section for THIS user
    const { data, error } = await supabase
      .from("course_path_section_progress")
      .update({ unlocked: true })
      .eq("user_id", userId) // Update for THIS user only
      .eq("course_path_section_id", nextSection.id)
      .select();

    if (error) {
      console.error("Server Action: Unlock error:", error);
      throw new Error(`Failed to unlock next section: ${error.message}`);
    }

    console.log("✅ Server Action: Next section unlocked for user:", data);

    // Revalidate the course page to reflect changes
    revalidatePath("/courses/[slug]/[courseId]", "page");

    return {
      success: true,
      data,
      message: "Next section unlocked successfully",
    };
  } catch (error) {
    console.error("Server Action: Unexpected error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

export async function checkUserProgress(courseSlug: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();

  // Get course
  const { data: course } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", courseSlug)
    .single();

  if (!course) {
    throw new Error("Course not found");
  }

  // Get course path
  const { data: coursePath } = await supabase
    .from("course_path")
    .select("id")
    .eq("course_id", course.id)
    .single();

  if (!coursePath) {
    throw new Error("Course path not found");
  }

  // Get all sections
  const { data: sections } = await supabase
    .from("course_path_sections")
    .select("id, title, order")
    .eq("course_path_id", coursePath.id)
    .order("order", { ascending: true });

  // Get user progress
  const { data: userProgress } = await supabase
    .from("course_path_section_progress")
    .select("*")
    .eq("user_id", userId)
    .in("course_path_section_id", sections?.map((s) => s.id) || []);

  console.log("=== USER PROGRESS DEBUG ===");
  console.log("User ID:", userId);
  console.log("Course:", course);
  console.log("Sections:", sections);
  console.log("User Progress:", userProgress);

  return {
    userId,
    course,
    sections,
    userProgress,
  };
}

// Utility function to reset user progress for a course (useful for testing)
export async function resetUserProgress(courseSlug: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = CreateSupabaseClient();

  // Get course
  const { data: course } = await supabase
    .from("courses")
    .select("id, slug")
    .eq("slug", courseSlug)
    .single();

  if (!course) {
    throw new Error("Course not found");
  }

  // Get course path
  const { data: coursePath } = await supabase
    .from("course_path")
    .select("id")
    .eq("course_id", course.id)
    .single();

  if (!coursePath) {
    throw new Error("Course path not found");
  }

  // Get all sections
  const { data: sections } = await supabase
    .from("course_path_sections")
    .select("id, order")
    .eq("course_path_id", coursePath.id)
    .order("order", { ascending: true });

  if (!sections) {
    throw new Error("No sections found");
  }

  // Find the minimum order
  const minOrder = Math.min(...sections.map((s) => s.order));

  // Delete existing progress for this user and course
  const { error: deleteError } = await supabase
    .from("course_path_section_progress")
    .delete()
    .eq("user_id", userId)
    .in(
      "course_path_section_id",
      sections.map((s) => s.id)
    );

  if (deleteError) {
    console.error("Error deleting progress:", deleteError);
    throw new Error("Failed to reset progress");
  }

  // Reinitialize progress (only first section unlocked)
  const progressRecords = sections.map((section) => ({
    user_id: userId,
    course_path_section_id: section.id,
    unlocked: section.order === minOrder, // First section (minimum order) unlocked
    completed: false,
    quiz_passed: false,
  }));

  const { error: insertError } = await supabase
    .from("course_path_section_progress")
    .insert(progressRecords);

  if (insertError) {
    console.error("Error reinitializing progress:", insertError);
    throw new Error("Failed to reinitialize progress");
  }

  console.log("✅ User progress reset successfully");

  // Revalidate
  revalidatePath("/courses/[slug]", "page");
  revalidatePath("/courses/[slug]/[courseId]", "page");

  return {
    message: "Progress reset successfully",
    sectionsReset: sections.length,
  };
}

// Add this to your course-actions.ts file

// Helper function to get user premium status
const getUserPremiumStatus = async (userId: string) => {
  const supabase = CreateSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("is_premium")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user premium status:", error);
    return false; // Default to non-premium if error
  }

  return user?.is_premium || false;
};

// Enhanced function to initialize ALL eligible courses for a user
export const initializeAllCoursesForUser = async (userId: string) => {
  console.log("🔧 Initializing all eligible courses for user:", userId);
  const supabase = CreateSupabaseClient();

  try {
    // Get user premium status
    const isPremium = await getUserPremiumStatus(userId);
    console.log("👤 User premium status:", isPremium);

    // Get all courses based on user's premium status
    let coursesQuery = supabase.from("courses").select("id, slug, is_premium");

    if (!isPremium) {
      // Non-premium users only see free courses
      coursesQuery = coursesQuery.or("is_premium.is.null,is_premium.eq.false");
    }
    // Premium users see all courses (no filter needed)

    const { data: eligibleCourses, error: coursesError } = await coursesQuery;

    if (coursesError) {
      console.error("Error fetching eligible courses:", coursesError);
      return;
    }

    console.log(
      `📚 Found ${eligibleCourses?.length || 0} eligible courses for user`
    );

    // Initialize progress for each eligible course
    for (const course of eligibleCourses || []) {
      await initializeUserProgress(userId, course.id);
    }

    console.log("✅ Completed initialization for all eligible courses");
  } catch (error) {
    console.error("Error in initializeAllCoursesForUser:", error);
  }
};

// Enhanced initializeUserProgress with premium check and first section unlock
const initializeUserProgressEnhanced = async (
  userId: string,
  courseId: string
) => {
  console.log("🔧 Initializing user progress for:", { userId, courseId });
  const supabase = CreateSupabaseClient();

  try {
    // Check if user should have access to this course
    const isPremium = await getUserPremiumStatus(userId);

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, is_premium")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      console.error("Course not found for initialization");
      return;
    }

    // Check if non-premium user is trying to access premium course
    if (!isPremium && course.is_premium) {
      console.log("❌ Non-premium user cannot access premium course");
      return;
    }

    // Get course path
    const { data: coursePath, error: coursePathError } = await supabase
      .from("course_path")
      .select("id")
      .eq("course_id", courseId)
      .single();

    if (coursePathError || !coursePath) {
      console.error("Course path not found for initialization");
      return;
    }

    // Get all sections for this course
    const { data: sections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select("id, order")
      .eq("course_path_id", coursePath.id)
      .order("order", { ascending: true });

    if (sectionsError || !sections || sections.length === 0) {
      console.error("Sections not found for initialization");
      return;
    }

    // Check if user already has progress records for this course
    const { data: existingProgress, error: progressCheckError } = await supabase
      .from("course_path_section_progress")
      .select("course_path_section_id")
      .eq("user_id", userId)
      .in(
        "course_path_section_id",
        sections.map((s) => s.id)
      );

    if (progressCheckError) {
      console.error("Error checking existing progress:", progressCheckError);
      return;
    }

    // Find the minimum order (first section)
    const minOrder = Math.min(...sections.map((s) => s.order));
    console.log("📊 Minimum section order (first section):", minOrder);
    const firstSection = sections.find((s) => s.order === minOrder);

    // If user has no progress at all for this course, create progress for all sections
    if (!existingProgress || existingProgress.length === 0) {
      console.log("🆕 Creating initial progress records for user");

      const progressRecords = sections.map((section) => ({
        user_id: userId,
        course_path_section_id: section.id,
        unlocked: section.order === minOrder, // First section is always unlocked
        completed: false,
        quiz_passed: false,
      }));

      const { error: insertError } = await supabase
        .from("course_path_section_progress")
        .insert(progressRecords);

      if (insertError) {
        console.error("Error initializing user progress:", insertError);
      } else {
        console.log(
          "✅ Initialized progress for all sections, first section unlocked"
        );
      }
    } else {
      console.log(
        "📋 User already has progress records, checking for missing sections and first section unlock"
      );

      // Check if there are missing sections and add them
      const existingIds = existingProgress.map((p) => p.course_path_section_id);
      const sectionsToCreate = sections.filter(
        (s) => !existingIds.includes(s.id)
      );

      if (sectionsToCreate.length > 0) {
        console.log(
          `➕ Adding ${sectionsToCreate.length} missing progress records`
        );

        const progressRecords = sectionsToCreate.map((section) => ({
          user_id: userId,
          course_path_section_id: section.id,
          unlocked: section.order === minOrder, // First section is always unlocked
          completed: false,
          quiz_passed: false,
        }));

        const { error: insertError } = await supabase
          .from("course_path_section_progress")
          .insert(progressRecords);

        if (insertError) {
          console.error("Error adding missing progress records:", insertError);
        } else {
          console.log("✅ Added missing progress records");
        }
      }

      // Ensure first section is always unlocked (fix for existing users)
      if (firstSection) {
        const { error: unlockError } = await supabase
          .from("course_path_section_progress")
          .update({ unlocked: true })
          .eq("user_id", userId)
          .eq("course_path_section_id", firstSection.id)
          .eq("unlocked", false); // Only update if currently locked

        if (unlockError) {
          console.error("Error unlocking first section:", unlockError);
        } else {
          console.log("✅ Ensured first section is unlocked");
        }
      }
    }
  } catch (error) {
    console.error("Error in initializeUserProgressEnhanced:", error);
  }
};

// Function to run when user signs up or when their premium status changes
export const handleUserStatusChange = async (
  userId: string,
  newPremiumStatus?: boolean
) => {
  console.log("🔄 Handling user status change:", { userId, newPremiumStatus });

  try {
    if (newPremiumStatus !== undefined) {
      // Premium status changed - reinitialize all courses
      await initializeAllCoursesForUser(userId);
    } else {
      // New user signup - initialize based on current status
      await initializeAllCoursesForUser(userId);
    }
  } catch (error) {
    console.error("Error handling user status change:", error);
  }
};

// Function to handle premium upgrade
export const handlePremiumUpgrade = async (userId: string) => {
  console.log("⭐ Handling premium upgrade for user:", userId);
  const supabase = CreateSupabaseClient();

  try {
    // Get all premium courses that user doesn't have access to yet
    const { data: premiumCourses, error: coursesError } = await supabase
      .from("courses")
      .select("id")
      .eq("is_premium", true);

    if (coursesError) {
      console.error("Error fetching premium courses:", coursesError);
      return;
    }

    // Initialize progress for each premium course
    for (const course of premiumCourses || []) {
      await initializeUserProgressEnhanced(userId, course.id);
    }

    console.log("✅ Premium upgrade initialization completed");
  } catch (error) {
    console.error("Error in handlePremiumUpgrade:", error);
  }
};

// Webhook handler for Clerk user creation
export const handleClerkUserCreated = async (userData: any) => {
  console.log("👤 New user created via Clerk:", userData.id);

  try {
    // Wait a moment for user to be fully created in your users table
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Initialize all eligible courses for the new user
    await initializeAllCoursesForUser(userData.id);

    console.log("✅ New user course initialization completed");
  } catch (error) {
    console.error("Error in handleClerkUserCreated:", error);
  }
};

// Replace the existing initializeUserProgress with this enhanced version
// (You can keep the old one as initializeUserProgressLegacy if needed)
export { initializeUserProgressEnhanced as initializeUserProgress };

// Add these utility functions to your course-actions.ts

// Function to migrate existing users to the new system
export const migrateExistingUsers = async () => {
  console.log("🔄 Starting migration of existing users...");
  const supabase = CreateSupabaseClient();

  try {
    // Get all existing users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, is_premium");

    if (usersError) {
      console.error("Error fetching users for migration:", usersError);
      return;
    }

    console.log(`📊 Found ${users?.length || 0} users to migrate`);

    // Initialize courses for each user
    for (const user of users || []) {
      console.log(
        `🔄 Migrating user: ${user.id} (Premium: ${user.is_premium})`
      );
      await initializeAllCoursesForUser(user.id);
    }

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

// Function to fix first section unlock for all users
export const fixFirstSectionUnlockForAllUsers = async () => {
  console.log("🔧 Fixing first section unlock for all users...");
  const supabase = CreateSupabaseClient();

  try {
    // Get all course paths with their first sections
    const { data: coursePaths, error: pathsError } = await supabase.from(
      "course_path"
    ).select(`
        id,
        course_path_sections (
          id,
          order
        )
      `);

    if (pathsError) {
      console.error("Error fetching course paths:", pathsError);
      return;
    }

    // Process each course path
    for (const path of coursePaths || []) {
      if (!path.course_path_sections.length) continue;

      // Find the first section (minimum order)
      const minOrder = Math.min(
        ...path.course_path_sections.map((s) => s.order)
      );
      const firstSection = path.course_path_sections.find(
        (s) => s.order === minOrder
      );

      if (firstSection) {
        console.log(`🔓 Unlocking first section for course path: ${path.id}`);

        // Unlock first section for all users who have progress records
        const { error: unlockError } = await supabase
          .from("course_path_section_progress")
          .update({ unlocked: true })
          .eq("course_path_section_id", firstSection.id)
          .eq("unlocked", false);

        if (unlockError) {
          console.error(
            `Error unlocking first section for path ${path.id}:`,
            unlockError
          );
        }
      }
    }

    console.log("✅ First section unlock fix completed");
  } catch (error) {
    console.error("Error fixing first section unlock:", error);
  }
};

// Function to handle when a user becomes premium
export const upgradeUserToPremium = async (userId: string) => {
  console.log("⭐ Upgrading user to premium:", userId);
  const supabase = CreateSupabaseClient();

  try {
    // First update the user's premium status
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_premium: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user premium status:", updateError);
      return;
    }

    // Then initialize premium courses
    await handlePremiumUpgrade(userId);

    console.log("✅ User premium upgrade completed");
  } catch (error) {
    console.error("Error upgrading user to premium:", error);
  }
};

// Function to handle when a user downgrades from premium
export const downgradeUserFromPremium = async (userId: string) => {
  console.log("📉 Downgrading user from premium:", userId);
  const supabase = CreateSupabaseClient();

  try {
    // Update user's premium status
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_premium: false })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user premium status:", updateError);
      return;
    }

    // Remove access to premium courses
    // Get all premium courses
    const { data: premiumCourses, error: coursesError } = await supabase
      .from("courses")
      .select(
        `
        id,
        course_path (
          id,
          course_path_sections (
            id
          )
        )
      `
      )
      .eq("is_premium", true);

    if (coursesError) {
      console.error("Error fetching premium courses:", coursesError);
      return;
    }

    // Remove progress records for premium courses
    for (const course of premiumCourses || []) {
      if (course.course_path?.course_path_sections) {
        const sectionIds = course.course_path.course_path_sections.map(
          (s) => s.id
        );

        const { error: deleteError } = await supabase
          .from("course_path_section_progress")
          .delete()
          .eq("user_id", userId)
          .in("course_path_section_id", sectionIds);

        if (deleteError) {
          console.error(
            `Error removing premium course progress for course ${course.id}:`,
            deleteError
          );
        }
      }
    }

    console.log("✅ User premium downgrade completed");
  } catch (error) {
    console.error("Error downgrading user from premium:", error);
  }
};

// Debug function to check user's course access
export const debugUserCourseAccess = async (userId: string) => {
  console.log("🔍 Debugging user course access for:", userId);
  const supabase = CreateSupabaseClient();

  try {
    // Get user details
    const { data: user } = await supabase
      .from("users")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("👤 User details:", user);

    // Get all courses
    const { data: courses } = await supabase
      .from("courses")
      .select("id, slug, is_premium");

    console.log("📚 All courses:", courses);

    // Get user's progress records
    const { data: progress } = await supabase
      .from("course_path_section_progress")
      .select(
        `
        *,
        course_path_sections (
          id,
          title,
          course_path (
            course_id,
            courses (
              slug,
              is_premium
            )
          )
        )
      `
      )
      .eq("user_id", userId);

    console.log("📊 User progress records:", progress);

    return {
      user,
      courses,
      progress,
    };
  } catch (error) {
    console.error("Error debugging user course access:", error);
  }
};
