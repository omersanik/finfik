export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizData {
  options: QuizOption[];
}

export interface ContentItem {
  id: string;
  block_id: string;
  type:
    | "text"
    | "image"
    | "quiz"
    | "animation"
    | "calculator"
    | "math"
    | "chart"
    | "drag-drop";
  content_text?: string;
  image_url?: string;
  quiz_data?: QuizData;
  component_key?: string;
  order_index: number;
  created_at: string;
}

export interface Block {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}
