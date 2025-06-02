import MainCardComponent from "@/components/MainCardComponent";
import SectionCardComponent from "@/components/SectionCardComponent";
import { getAllCourses } from "@/lib/db/actions/course-actions";
import finance1 from "@/thumbnails/finance1.webp";
import finance2 from "@/thumbnails/finance2.webp";
import finance3 from "@/thumbnails/finance3.webp";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId } = await auth();

  if (!userId) {
    return <h1 className="text-3xl m-10">Landing Page</h1>;
  }

  // Fetch main courses from Supabase
  const mainCourse = await getAllCourses();
  const firstCourse = mainCourse?.[0];

  // const safeImageUrl = (url?: string) => {
  //   if (!url || url.trim() === "" || url.startsWith("@")) {
  //     return "/thumbnails/default.png"; // must exist in /public/thumbnails/
  //   }
  //   return url.trim();
  // };

  return (
    <main>
      <h1 className="text-3xl font-semibold my-10 mx-10 font-serif">
        Keep going where you left off
      </h1>

      {firstCourse ? (
        <MainCardComponent
          title={firstCourse.title}
          thumbnail={firstCourse.thumbnail_url}
          description={firstCourse.description}
          slug={firstCourse.slug}
        />
      ) : (
        <p className="mx-10 text-gray-500">
          No course found. Start learning now!
        </p>
      )}

      <p className="text-3xl font-bold pt-6 my-6 mx-10">Your Courses</p>

      <div className="flex items-center justify-center max-sm:flex-col px-12 mb-6">
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance1}
        />
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance2}
        />
        <SectionCardComponent
          title="Financial Budgeting"
          thumbnail={finance3}
        />
      </div>
    </main>
  );
};

export default Page;
