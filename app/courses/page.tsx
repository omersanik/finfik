// app/courses/page.tsx
import CoursesCardComponent from "@/components/CoursesCardComponent";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Sparkles } from "lucide-react";

const Page = async () => {
  const { userId, getToken } = await auth();

  if (!userId)
    return <div className="p-8">Please sign in to view courses.</div>;

  const token = await getToken();

  // For server-side rendering, use environment variable or fallback to relative URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Check if user has any enrolled courses
  let hasEnrolledCourses = false;
  try {
    const enrolledRes = await fetch(`${baseUrl}/api/progress/enrolled-courses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (enrolledRes.ok) {
      const enrolledCourses = await enrolledRes.json();
      hasEnrolledCourses = enrolledCourses.length > 0;
    }
  } catch (err) {
    console.error("Error checking enrolled courses:", err);
  }



  const res = await fetch(`${baseUrl}/api/courses/available-for-user`, {
    next: { revalidate: 300 },
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
    is_premium_course?: boolean;
    coming_soon?: boolean;
    course_level?: 'Easy' | 'Medium' | 'Hard';
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
      {/* Special welcome message for users with no enrolled courses */}
      {!hasEnrolledCourses && (
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary mb-2">
                Welcome to Your Learning Journey! 🎉
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Pick your first course and start building your financial knowledge today
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-blue-100 rounded-full mb-2">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Learn at Your Pace</h3>
                  <p className="text-xs text-muted-foreground">Self-paced courses designed for busy learners</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-green-100 rounded-full mb-2">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Practical Skills</h3>
                  <p className="text-xs text-muted-foreground">Real-world applications you can use immediately</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-purple-100 rounded-full mb-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Track Progress</h3>
                  <p className="text-xs text-muted-foreground">Build streaks and celebrate your achievements</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose a course below to begin your financial education journey!
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Title for users who already have courses */}
      {hasEnrolledCourses && (
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-semibold text-center mb-2">Available Courses</h1>
          <p className="text-muted-foreground text-center">Explore new courses to expand your knowledge</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: Course) => (
          <CoursesCardComponent
            key={course.slug}
            title={course.title}
            description={course.description}
            thumbnail={course.thumbnail_url}
            slug={course.slug}
            courseId={course.id}
            isPremium={course.is_premium_course}
            comingSoon={!!course.coming_soon}
            courseLevel={course.course_level}
          />
        ))}
      </div>
    </main>
  );
};

export default Page;
