import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/supabase-client";

// --- Table Types --- //
interface CoursePath {
  id: string;
  course_id: string;
}

interface CoursePathSection {
  id: string;
  course_path_id: string;
  order: number;
}

interface CoursePathSectionProgress {
  course_path_section_id: string;
  unlocked: boolean;
  completed: boolean;
}

// --- API Handler --- //
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseIds } = (await request.json()) as { courseIds: string[] };
    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json(
        { error: "Course IDs array is required" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;
    const results: Record<
      string,
      { progress: number; totalSections: number; completedSections: number }
    > = {};

    // Get all course paths for these courses
    const { data: coursePaths, error: coursePathsError } = await supabase
      .from("course_path")
      .select("id, course_id")
      .in("course_id", courseIds);

    if (coursePathsError) {
      console.error("Error fetching course paths:", coursePathsError);
      return NextResponse.json(
        { error: "Failed to fetch course paths" },
        { status: 500 }
      );
    }

    if (!coursePaths || coursePaths.length === 0) {
      // Return 0 progress for all courses
      courseIds.forEach((courseId) => {
        results[courseId] = {
          progress: 0,
          totalSections: 0,
          completedSections: 0,
        };
      });
      return NextResponse.json(results);
    }

    const coursePathIds = coursePaths.map((cp: CoursePath) => cp.id);

    // Get all sections for all course paths
    const { data: sections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select("id, course_path_id, order")
      .in("course_path_id", coursePathIds)
      .order("order");

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch sections" },
        { status: 500 }
      );
    }

    if (!sections || sections.length === 0) {
      // Return 0 progress for all courses
      courseIds.forEach((courseId) => {
        results[courseId] = {
          progress: 0,
          totalSections: 0,
          completedSections: 0,
        };
      });
      return NextResponse.json(results);
    }

    const sectionIds = sections.map((s: CoursePathSection) => s.id);

    // Get all progress for this user across all sections
    const { data: progress, error: progressError } = await supabase
      .from("course_path_section_progress")
      .select("course_path_section_id, unlocked, completed")
      .eq("clerk_id", userId)
      .in("course_path_section_id", sectionIds);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress" },
        { status: 500 }
      );
    }

    // Create a map of section_id to progress
    const progressMap = new Map<string, CoursePathSectionProgress>();
    progress?.forEach((p: CoursePathSectionProgress) => {
      progressMap.set(p.course_path_section_id, p);
    });

    // Group sections by course
    const courseSections = new Map<string, CoursePathSection[]>();
    sections.forEach((section: CoursePathSection) => {
      const coursePath = coursePaths.find(
        (cp: CoursePath) => cp.id === section.course_path_id
      );
      if (coursePath) {
        if (!courseSections.has(coursePath.course_id)) {
          courseSections.set(coursePath.course_id, []);
        }
        courseSections.get(coursePath.course_id)!.push(section);
      }
    });

    // Calculate progress for each course
    courseIds.forEach((courseId) => {
      const courseSectionsList = courseSections.get(courseId) || [];
      const totalSections = courseSectionsList.length;

      if (totalSections === 0) {
        results[courseId] = {
          progress: 0,
          totalSections: 0,
          completedSections: 0,
        };
        return;
      }

      // Count completed sections for this course instead of unlocked sections
      let completedSections = 0;
      courseSectionsList.forEach((section) => {
        const sectionProgress = progressMap.get(section.id);
        if (sectionProgress?.completed) {
          completedSections++;
        }
      });

      // Calculate progress: (completed sections / total sections) * 100
      const progressPercentage = Math.round(
        (completedSections / totalSections) * 100
      );

      results[courseId] = {
        progress: progressPercentage,
        totalSections,
        completedSections,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error calculating batch course progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
