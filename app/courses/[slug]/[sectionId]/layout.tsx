import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import LayoutWrapper from "@/components/LayoutWrapper";
import CourseIdNavbar from "@/components/CourseIdNavbar";

export const metadata: Metadata = {
  title: "Course Page",
  description: "Detailed course content page",
};

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
    courseId: string;
  }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  // Await params before using its properties
  const { slug } = await params;

  // You'll need to calculate these values based on actual progress
  // For now using placeholder values
  const currentProgress = 3;
  const totalProgress = 10;

  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <LayoutWrapper>
          <CourseIdNavbar
            hrefX={`/courses/${slug}`}
            currentProgress={currentProgress}
            totalProgress={totalProgress}
          />
          <div className="pt-20">{children}</div>
        </LayoutWrapper>
      </ThemeProvider>
    </ClerkProvider>
  );
}
