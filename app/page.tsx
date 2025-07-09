import MainCardComponent from "@/components/MainCardComponent";
import SectionCardComponent from "@/components/SectionCardComponent";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId, getToken } = await auth();

  if (!userId) {
    return <h1 className="text-3xl m-10">Landing Page</h1>;
  }

  const token = await getToken();

  type Course = {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string;
    description: string;
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
    if (!res.ok) throw new Error(`Failed to fetch last taken course: ${res.status}`);
    lastTakenCourse = await res.json();
  } catch (err) {
    console.error("Error fetching last taken course:", err);
  }

  // Remove enrolled from the main course list
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const unEnrolledCourses = allCourses.filter(
    (course) => !enrolledIds.has(course.id)
  );

  return (
    <main className="bg-background text-foreground min-h-screen">
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>

      {lastTakenCourse ? (
        <MainCardComponent
          title={lastTakenCourse.title}
          thumbnail={lastTakenCourse.thumbnail_url}
          description={lastTakenCourse.description}
          slug={lastTakenCourse.slug}
          courseId={lastTakenCourse.id}
        />
      ) : (
        <p className="mx-10 text-gray-500">
          No recent course found. Start a new one below!
        </p>
      )}

      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>

      <div className="flex flex-wrap gap-6 justify-start px-12 mb-6">
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course: Course) => (
            <SectionCardComponent
              key={course.id}
              title={course.title}
              thumbnail={course.thumbnail_url}
              slug={course.slug}
              courseId={course.id}
            />
          ))
        ) : (
          <p className="text-gray-500">
            You haven't enrolled in any courses yet.
          </p>
        )}
      </div>
    </main>
  );
};

export default Page;
