"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainCardComponent from "./MainCardComponent";
import SectionCardComponent from "./SectionCardComponent";
import StreakCounter from "./StreakCounter";
import MainCardSkeleton from "./skeletons/MainCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  description: string;
  coming_soon?: boolean;
  course_level?: "Easy" | "Medium" | "Hard";
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  week: boolean[];
}

interface CourseProgress {
  progress: number;
  // Add other properties as needed
}

interface MainPageWrapperProps {
  initialData: {
    allCourses: Course[];
    enrolledCourses: Course[];
    lastTakenCourse: Course | null;
    courseProgress: Record<string, CourseProgress>;
    streak: Streak;
  };
}

export default function MainPageWrapper({ initialData }: MainPageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show skeleton briefly for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const { enrolledCourses, lastTakenCourse, courseProgress, streak } =
    initialData;
  const visibleEnrolledCourses = enrolledCourses.filter(
    (course) => !course.coming_soon
  );

  return (
    <main className="bg-background text-foreground min-h-screen flex flex-col">
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>

      <div className="mx-10 mb-8 flex flex-col md:flex-row md:items-start justify-center gap-2">
        {lastTakenCourse && !isLoading ? (
          <>
            <div className="flex-1 max-w-xl flex md:block items-start">
              <MainCardComponent
                title={lastTakenCourse.title}
                thumbnail={lastTakenCourse.thumbnail_url}
                description={lastTakenCourse.description}
                slug={lastTakenCourse.slug}
                courseId={lastTakenCourse.id}
                comingSoon={!!lastTakenCourse.coming_soon}
                courseLevel={lastTakenCourse.course_level}
              />
            </div>
            <div className="flex-shrink-0 flex md:block items-start">
              <StreakCounter
                currentStreak={streak.current_streak}
                longestStreak={streak.longest_streak}
                lastCompletedDate={streak.last_completed_date}
                week={streak.week}
              />
            </div>
          </>
        ) : (
          <>
            {/* Show skeleton while loading or no lastTakenCourse */}
            <div className="flex-1 max-w-xl flex md:block items-start">
              <MainCardSkeleton />
            </div>
            <div className="flex-shrink-0 flex md:block items-start">
              <Skeleton className="w-[300px] h-[200px] rounded-xl" />
            </div>
          </>
        )}
      </div>

      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-12 mb-6">
        {visibleEnrolledCourses.map((course: Course) => (
          <SectionCardComponent
            key={course.id}
            title={course.title}
            thumbnail={course.thumbnail_url}
            slug={course.slug}
            courseId={course.id}
            initialProgress={courseProgress[course.id]?.progress || 0}
            comingSoon={!!course.coming_soon}
            courseLevel={course.course_level}
          />
        ))}
      </div>

      <div className="text-center py-4 px-12">
        <p className="text-muted-foreground text-sm">
          Want to explore more courses?
          <Link href="/courses" className="text-primary hover:underline ml-1">
            Browse all available courses
          </Link>
        </p>
      </div>
    </main>
  );
}
