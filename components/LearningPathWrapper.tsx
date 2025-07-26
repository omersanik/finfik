// components/LearningPathWrapper.tsx
import React, { useState } from "react";

import { getCoursePathSections } from "@/lib/db/actions/course-actions";
import LearningPath from "./LearningPath";
import { Loader2 } from "lucide-react";

interface LearningPathWrapperProps {
  coursePathId: string;
}

export default async function LearningPathWrapper({ coursePathId }: LearningPathWrapperProps) {
  console.log("LearningPathWrapper: Fetching sections for course path:", coursePathId);
  const sections = await getCoursePathSections(coursePathId);
  console.log("LearningPathWrapper: Fetched sections:", sections);

  return <LearningPath initialSections={sections} />;
}
