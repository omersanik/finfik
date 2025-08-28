import { auth } from "@clerk/nextjs/server";
import BeautifulLandingPage from "@/components/BeautifulLandingPage";
import MainPageWrapper from "@/components/MainPageWrapper";
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
    course_level?: "Easy" | "Medium" | "Hard";
  };

  type Streak = {
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
    week: boolean[];
  };

  // For server-side rendering, use environment variable or fallback to relative URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  let allCourses: Course[] = [];
  let enrolledCourses: Course[] = [];
  let lastTakenCourse: Course | null = null;

  // Fetch all courses
  try {
    const res = await fetch(`${baseUrl}/api/courses`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
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
      next: { revalidate: 60 }, // Cache for 1 minute
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
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    if (!res.ok)
      throw new Error(`Failed to fetch last taken course: ${res.status}`);
    lastTakenCourse = await res.json();
  } catch (err) {
    console.error("Error fetching last taken course:", err);
  }

  // Fetch progress for all enrolled courses
  let courseProgress: Record<string, unknown> = {};
  if (enrolledCourses.length > 0) {
    try {
      const courseIds = enrolledCourses.map((course) => course.id);
      const progressRes = await fetch(
        `${baseUrl}/api/progress/batch-course-progress`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseIds }),
          next: { revalidate: 60 }, // Cache for 1 minute
        }
      );

      if (progressRes.ok) {
        courseProgress = await progressRes.json();
      }
    } catch (err) {
      console.error("Error fetching course progress:", err);
    }
  }

  // Fetch streak
  let streak: Streak = {
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    week: [false, false, false, false, false, false, false],
  };
  try {
    const res = await fetch(`${baseUrl}/api/streak`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    if (res.ok) {
      streak = await res.json();
    }
  } catch (err) {
    console.error("Error fetching streak:", err);
  }

  // If user has no enrolled courses, redirect to courses page
  if (enrolledCourses.length === 0) {
    return redirect("/courses");
  }

  // Pass data to the client-side wrapper
  return (
    <MainPageWrapper
      initialData={{
        allCourses,
        enrolledCourses,
        lastTakenCourse,
        courseProgress,
        streak,
      }}
    />
  );
};

export default Page;
