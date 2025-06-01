import CourseLearningPathCardComponent from "@/components/CoursesLearningPathCardComponent";

import React from "react";
import thumbnail from "@/thumbnails/understanding-stocks.png";
import LearningPath from "@/components/LearningPath";
const LearningPaths = () => {
  return (
    <main className="min-h-screen  p-8 flex justify-center w-full gap-4">
      <div className="flex">
        <CourseLearningPathCardComponent
          title="Understanding Stocks"
          description="Understand the stocks by taking this course"
          thumbnail={thumbnail}
        />
      </div>

      <LearningPath />

      {/* Decorative background elements */}
    </main>
  );
};

export default LearningPaths;
