export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizData {
  question: string;
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
  content_type?: string;
  styling_data?: Record<string, unknown>;
  math_formula?: string;
  interactive_data?: Record<string, unknown>;
  media_files?: Record<string, unknown>;
  font_settings?: Record<string, unknown>;
  layout_config?: Record<string, unknown>;
  animation_settings?: Record<string, unknown>;
  drag_drop_title?: string;
  drag_drop_instructions?: string;
  drag_drop_categories?: string;
  drag_drop_items?: string;
}

export interface Block {
  id: string;
  section_id: string;
  title: string;
  order_index: number;
  created_at: string;
  content_items: ContentItem[];
}
