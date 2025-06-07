// app/courses/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import CourseContentPage from "@/components/CourseContentPage";
import { getCourseContent } from "@/lib/db/actions/course-actions";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CoursePage({ params }: PageProps) {
  try {
    const { slug } = params;

    console.log("📦 Slug received:", slug);

    const courseData = await getCourseContent(slug);

    if (!courseData) {
      notFound();
    }

    return <CourseContentPage courseData={courseData} />;
  } catch (error) {
    console.error("❌ Error loading course content:", error);
    notFound();
  }
}
