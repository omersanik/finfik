// import { fetchCourse, fetchCoursePath } from "@/lib/db/actions/course-actions";
import CourseLearningPathCardComponent from "@/components/CoursesLearningPathCardComponent";
import LearningPathClient from "@/components/LearningPath";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

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

export default async function CoursePage({ params }: CoursePageProps) {
  // Await params first
  const { slug } = await params;
  // Get authentication token first
  const { getToken, userId } = await auth();

  // Redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  if (!baseUrl) throw new Error("NEXT_PUBLIC_SITE_URL is not defined");

  // Get the session token for API requests
  const token = await getToken();

  // Fetch course path with authentication
  const pathRes = await fetch(`${baseUrl}/api/courses/${slug}/path`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!pathRes.ok)
    throw new Error(`Failed to fetch course path: ${pathRes.status}`);
  const path = await pathRes.json();

  // Fetch course info with authentication
  const courseRes = await fetch(`${baseUrl}/api/courses/${slug}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!courseRes.ok)
    throw new Error(`Failed to fetch course info: ${courseRes.status}`);
  const courseInfo = await courseRes.json();

  console.log("Slug received:", slug);

  if (courseInfo.coming_soon) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white border rounded-xl shadow p-10 max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-lg text-gray-600 mb-6">This course is not yet available. Please check back soon!</p>
          <Button asChild>
            <a href="/courses" className="text-white">Back to Courses</a>
          </Button>
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
      description: section.description ?? "No description", // Use the description from API
      lessons: section.lessons || [],
      courseSlug: slug,
      sectionSlug: section.slug?.trim() || section.slug, // Trim any leading/trailing spaces
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
          { !courseInfo.coming_soon && (
            <div className="flex-1 min-w-0">
              <LearningPathClient steps={steps} />
            </div>
          )}
          { courseInfo.coming_soon && (
            <div className="flex-1 min-w-0">
              <LearningPathClient steps={steps} comingSoon={true} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
