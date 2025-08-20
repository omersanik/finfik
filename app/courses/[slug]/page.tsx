import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CourseDetailWrapper from "@/components/CourseDetailWrapper";
import FastCourseLoader from "@/components/FastCourseLoader";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
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

  // For server-side rendering, use environment variable or fallback to relative URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Get the session token for API requests
  const token = await getToken();

  // Fetch course path with authentication
  const pathRes = await fetch(`${baseUrl}/api/courses/${slug}/path`, {
    next: { revalidate: 60 },
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
    next: { revalidate: 60 },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!courseRes.ok)
    throw new Error(`Failed to fetch course info: ${courseRes.status}`);
  const courseInfo = await courseRes.json();

  console.log("Slug received:", slug);

  // Pass data to the client-side wrapper with instant loading
  return (
    <>
      {/* Show skeleton immediately for instant loading feel */}
      <FastCourseLoader />
      
      <CourseDetailWrapper
        initialData={{
          path,
          courseInfo,
          slug,
        }}
      />
    </>
  );
}
