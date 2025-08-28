"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CourseDetailSkeleton from "./skeletons/CourseDetailSkeleton";
import LearningPathClient from "./LearningPath";
import CourseLearningPathCardComponent from "./CoursesLearningPathCardComponent";

interface CoursePathSection {
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  courseSlug: string;
  description: string;
  lessons: string[];
  sectionSlug: string;
}

// Define proper types for the course data
interface PathSection {
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  description?: string;
  lessons?: string[];
  slug?: string;
}

interface Path {
  sections: PathSection[];
}

interface CourseInfo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  coming_soon?: boolean;
  [key: string]: unknown; // For other properties that might be passed
}

interface CourseDetailWrapperProps {
  initialData: {
    path: Path;
    courseInfo: CourseInfo;
    slug: string;
  };
}

export default function CourseDetailWrapper({
  initialData,
}: CourseDetailWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show skeleton for a very brief moment for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50); // Super fast - only 50ms delay!

    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  const { path, courseInfo, slug } = initialData;

  if (courseInfo.coming_soon) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white border rounded-xl shadow p-10 max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-lg text-gray-600 mb-6">
            This course is not yet available. Please check back soon!
          </p>
          <Link
            href="/courses"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    );
  }

  const steps = path.sections.map(
    (section: PathSection): CoursePathSection => ({
      id: section.id,
      title: section.title,
      completed: section.completed,
      unlocked: section.unlocked,
      description: section.description ?? "No description",
      lessons: section.lessons || [],
      courseSlug: slug,
      sectionSlug: section.slug?.trim() || section.slug || "",
    })
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
          {/* Course Information Card - Left Side */}
          <div className="flex-shrink-0">
            <div className="w-[500px] h-[500px]">
              <CourseLearningPathCardComponent
                {...courseInfo}
                thumbnail={courseInfo.thumbnail_url}
                courseId={courseInfo.id}
                comingSoon={!!courseInfo.coming_soon}
              />
            </div>
          </div>

          {/* Learning Path - Right Side */}
          <div className="flex-1 min-w-0">
            <LearningPathClient steps={steps} />
          </div>
        </div>
      </div>
    </main>
  );
}
