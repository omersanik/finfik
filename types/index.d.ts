type GetMainCourseProps = {
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string;
  isPremium: boolean;
};

export interface Section {
  id: number;
  title: string;
  completed: boolean;
  unlocked: boolean;
  order: number;
  description: string;
  lessons: any[]; // or define lesson type
  content_blocks: ContentBlock[]; // ✅ ADD THIS
}
