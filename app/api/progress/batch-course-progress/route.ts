import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { CreateSupabaseClient } from "@/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseIds } = await request.json();
    if (!courseIds || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: "Course IDs array is required" }, { status: 400 });
    }

    const supabase = CreateSupabaseClient();
    const results: Record<string, any> = {};

    // Get all course paths for these courses
    const { data: coursePaths, error: coursePathsError } = await supabase
      .from("course_path")
      .select("id, course_id")
      .in("course_id", courseIds);

    if (coursePathsError) {
      console.error("Error fetching course paths:", coursePathsError);
      return NextResponse.json({ error: "Failed to fetch course paths" }, { status: 500 });
    }

    if (!coursePaths || coursePaths.length === 0) {
      // Return 0 progress for all courses
      courseIds.forEach(courseId => {
        results[courseId] = { progress: 0, totalSections: 0, unlockedSections: 0 };
      });
      return NextResponse.json(results);
    }

    const coursePathIds = coursePaths.map(cp => cp.id);

    // Get all sections for all course paths
    const { data: sections, error: sectionsError } = await supabase
      .from("course_path_sections")
      .select("id, course_path_id, order")
      .in("course_path_id", coursePathIds)
      .order("order");

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }

    if (!sections || sections.length === 0) {
      // Return 0 progress for all courses
      courseIds.forEach(courseId => {
        results[courseId] = { progress: 0, totalSections: 0, unlockedSections: 0 };
      });
      return NextResponse.json(results);
    }

    const sectionIds = sections.map(s => s.id);

    // Get all progress for this user across all sections
    const { data: progress, error: progressError } = await supabase
      .from("course_path_section_progress")
      .select("course_path_section_id, unlocked, completed")
      .eq("clerk_id", userId)
      .in("course_path_section_id", sectionIds);

    if (progressError) {
      console.error("Error fetching progress:", progressError);
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    // Create a map of section_id to progress
    const progressMap = new Map();
    progress?.forEach(p => {
      progressMap.set(p.course_path_section_id, p);
    });

    // Group sections by course
    const courseSections = new Map<string, any[]>();
    sections.forEach((section: any) => {
      const coursePath = coursePaths.find(cp => cp.id === section.course_path_id);
      if (coursePath) {
        if (!courseSections.has(coursePath.course_id)) {
          courseSections.set(coursePath.course_id, []);
        }
        courseSections.get(coursePath.course_id)!.push(section);
      }
    });

    // Calculate progress for each course
    courseIds.forEach(courseId => {
      const courseSectionsList = courseSections.get(courseId) || [];
      const totalSections = courseSectionsList.length;

      if (totalSections === 0) {
        results[courseId] = { 
          progress: 0, 
          totalSections: 0, 
          unlockedSections: 0 
        };
        return;
      }

      // Count unlocked sections for this course
      let unlockedSections = 0;
      courseSectionsList.forEach(section => {
        const sectionProgress = progressMap.get(section.id);
        if (sectionProgress && sectionProgress.unlocked) {
          unlockedSections++;
        }
      });

      // Calculate progress: (unlocked sections / total sections) * 100
      const progressPercentage = Math.round((unlockedSections / totalSections) * 100);

      results[courseId] = {
        progress: progressPercentage,
        totalSections,
        unlockedSections
      };
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Error calculating batch course progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 