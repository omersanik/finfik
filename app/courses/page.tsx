// app/courses/page.tsx
import CoursesCardComponent from "@/components/CoursesCardComponent";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId, getToken } = await auth();

  if (!userId)
    return <div className="p-8">Please sign in to view courses.</div>;

  const token = await getToken();

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

  const res = await fetch(`${baseUrl}/api/courses/available-for-user`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  type Course = {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string;
    description: string;
  };
  let courses: Course[] = [];
  if (!res.ok) {
    const errorText = await res.text();
    return (
      <div className="p-8 text-red-600">
        Failed to fetch courses: {res.status} - {errorText}
      </div>
    );
  }
  courses = await res.json();

  return (
    <main className="p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: Course) => (
          <CoursesCardComponent
            key={course.slug}
            title={course.title}
            description={course.description}
            thumbnail={course.thumbnail_url}
            slug={course.slug}
            courseId={course.id}
          />
        ))}
      </div>
    </main>
  );
};

export default Page;
