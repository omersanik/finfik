import MainCardComponent from "@/components/MainCardComponent";
import SectionCardComponent from "@/components/SectionCardComponent";
import { auth } from "@clerk/nextjs/server";
import BeautifulLandingPage from "@/components/BeautifulLandingPage";
import StreakCounter from "@/components/StreakCounter";
import { redirect } from "next/navigation";

const Page = async () => {
  const { userId, getToken } = await auth();

  if (!userId) {
    // Render the new beautiful landing page component
    return <BeautifulLandingPage />;
  }

  const token = await getToken();

  type Course = {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string;
    description: string;
    coming_soon?: boolean;
    course_level?: 'Easy' | 'Medium' | 'Hard';
  };

  type Streak = {
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
    week: boolean[];
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let allCourses: Course[] = [];
  let enrolledCourses: Course[] = [];
  let lastTakenCourse: Course | null = null;

  // Fetch all courses
  try {
    const res = await fetch(`${baseUrl}/api/courses`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch courses: ${res.status}`);
    allCourses = await res.json();
  } catch (err) {
    console.error("Error fetching all courses:", err);
  }

  // Fetch enrolled courses
  try {
    const res = await fetch(`${baseUrl}/api/progress/enrolled-courses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch enrolled: ${res.status}`);
    enrolledCourses = await res.json();
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
  }

  // Fetch last taken course
  try {
    const res = await fetch(`${baseUrl}/api/progress/recent-course`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok)
      throw new Error(`Failed to fetch last taken course: ${res.status}`);
    lastTakenCourse = await res.json();
  } catch (err) {
    console.error("Error fetching last taken course:", err);
  }

  // Fetch progress for all enrolled courses
  let courseProgress: Record<string, any> = {};
  if (enrolledCourses.length > 0) {
    try {
      const courseIds = enrolledCourses.map(course => course.id);
      const progressRes = await fetch(`${baseUrl}/api/progress/batch-course-progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseIds }),
      });
      
      if (progressRes.ok) {
        courseProgress = await progressRes.json();
      }
    } catch (err) {
      console.error("Error fetching course progress:", err);
    }
  }

  // Fetch streak
  let streak: Streak = { current_streak: 0, longest_streak: 0, last_completed_date: null, week: [false, false, false, false, false, false, false] };
  try {
    const res = await fetch(`${baseUrl}/api/streak`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
      cache: "no-store",
    });
    if (res.ok) {
      streak = await res.json();
    }
  } catch (err) {
    console.error("Error fetching streak:", err);
  }

  // Remove enrolled from the main course list
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const unEnrolledCourses = allCourses.filter(
    (course) => !enrolledIds.has(course.id) && !course.coming_soon
  );
  const visibleEnrolledCourses = enrolledCourses.filter((course) => !course.coming_soon);

  // If user has no enrolled courses, redirect to courses page
  if (enrolledCourses.length === 0) {
    return redirect('/courses');
  }

  return (
    <main className="bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>
      <div className="mx-10 mb-8 flex flex-col md:flex-row md:items-start justify-center gap-2">
        {lastTakenCourse ? (
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
          <div className="w-full flex flex-col items-center">
            <p className="text-gray-500 mt-6">
              No recent course found. Start a new one below!
            </p>
          </div>
        )}
      </div>

      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>

      {visibleEnrolledCourses.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 px-12">
          <p className="text-muted-foreground text-lg">
            You haven't enrolled in any courses yet. 
            <a href="/courses" className="text-primary hover:underline ml-1">
              Browse available courses
            </a>
          </p>
        </div>
      )}

      {/* Show available courses section only if there are unenrolled courses */}
      {unEnrolledCourses.length > 0 && (
        <>
          <p className="text-3xl font-bold pt-6 my-6 mx-10">Available Courses</p>
          <p className="text-muted-foreground mx-10 mb-6">
            Explore these courses to expand your financial knowledge
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-12 mb-6">
            {unEnrolledCourses.map((course: Course) => (
              <SectionCardComponent
                key={course.id}
                title={course.title}
                thumbnail={course.thumbnail_url}
                slug={course.slug}
                courseId={course.id}
                initialProgress={0}
                comingSoon={!!course.coming_soon}
                courseLevel={course.course_level}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
};

export default Page;
