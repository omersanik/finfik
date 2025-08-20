"use client";

import { useState, useEffect } from "react";
import CourseDetailSkeleton from "./skeletons/CourseDetailSkeleton";
import CourseLearningPathCardComponent from "./CoursesLearningPathCardComponent";
import LearningPathClient from "./LearningPath";

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

interface CourseDetailWrapperProps {
  initialData: {
    path: any;
    courseInfo: any;
    slug: string;
  };
}

export default function CourseDetailWrapper({ initialData }: CourseDetailWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    // Show skeleton briefly for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  const { path, courseInfo, slug } = data;

  if (courseInfo.coming_soon) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white border rounded-xl shadow p-10 max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-lg text-gray-600 mb-6">This course is not yet available. Please check back soon!</p>
          <a href="/courses" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
            Back to Courses
          </a>
        </div>
      </main>
    );
  }

  const steps = path.sections.map(
    (section: any): CoursePathSection => ({
      id: section.id,
      title: section.title,
      completed: section.completed,
      unlocked: section.unlocked,
      description: section.description ?? "No description",
      lessons: section.lessons || [],
      courseSlug: slug,
      sectionSlug: section.slug?.trim() || section.slug,
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
