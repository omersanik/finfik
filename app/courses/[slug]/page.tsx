import { fetchCourse, fetchCoursePath } from "@/lib/db/actions/course-actions";
import CourseLearningPathCardComponent from "@/components/CoursesLearningPathCardComponent";
import LearningPathClient from "@/components/LearningPath";

interface CoursePageProps {
  params: { slug: string };
}
interface CoursePathSection {
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  description: string;
  lessons: string[];
  courseSlug: string; // 👈 Add this
}

export default async function CoursePage({ params }: CoursePageProps) {
  const path = await fetchCoursePath(params.slug);
  const courseInfo = await fetchCourse(params.slug);
  console.log("Slug received:", params.slug);

  const steps = path.sections.map(
    (section: any, index: number): Lesson => ({
      id: String(section.id), // 👈 ensure it's a string
      title: section.title,
      completed: section.completed,
      unlocked: section.unlocked,
      description: section.description ?? "No description",
      lessons: section.lessons || [],
      courseSlug: params.slug,
      order: index, // 👈 add this
      quiz_passed: section.quiz_passed ?? false, // 👈 add this
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
              />
            </div>
          </div>

          {/* Learning Path - Right Side */}
          <div className="flex-1 min-w-0">
            <LearningPathClient steps={steps} />
          </div>
        </div>
      </div>
    </main>
  );
}
