import CoursesCardComponent from "@/components/CoursesCardComponent";
import { getAllCourses } from "@/lib/db/actions/course-actions";
import React from "react";

const Page = async () => {
  const courses = await getAllCourses(); // ✅ properly awaited

  return (
    <main className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <CoursesCardComponent
            key={course.slug}
            title={course.title}
            description={course.description}
            thumbnail={course.thumbnail_url}
            slug={course.slug}
            sections={course.sections}
          />
        ))}
      </div>
    </main>
  );
};

export default Page;
