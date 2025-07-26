"use client";
import EnhancedContentEditor from './EnhancedContentEditor';
import ChartEditor from './ChartEditor';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  course_id: z.string().min(1, "Course is required"),
  section_id: z.string().min(1, "Section is required"),
  block_id: z.string().min(1, "Content Block is required"),
  order_index: z.number().int().min(0, "Order index must be a non-negative integer"),
  type: z.string().min(1, "Content type is required"),
  image_url: z.string().optional(),
  quiz_data: z.string().optional(),
  quiz_question: z.string().optional(),
  content_text: z.string().optional(),
}).refine((data) => {
  // For chart type, content_text is optional (will be JSON)
  if (data.type === 'chart') {
    return true;
  }
  // For other types, content_text is required
  return data.content_text && data.content_text.trim().length > 0;
}, {
  message: "Content is required",
  path: ["content_text"]
});

type ContentItemFormValues = z.infer<typeof formSchema>;

export default function AddContentItems() {
  const [message, setMessage] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [errorCourses, setErrorCourses] = useState("");
  const [errorSections, setErrorSections] = useState("");
  const [errorBlocks, setErrorBlocks] = useState("");

  const form = useForm<ContentItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_id: "",
      section_id: "",
      block_id: "",
      order_index: 0,
      type: "",
      image_url: "",
      quiz_data: "",
      quiz_question: "",
      content_text: "",
    },
  });

  // Fetch courses on mount
  useEffect(() => {
    setLoadingCourses(true);
    fetch("/api/admin/course-paths")
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoadingCourses(false);
      })
      .catch(() => {
        setErrorCourses("Failed to load courses");
        setLoadingCourses(false);
      });
  }, []);

  // Fetch sections when course changes
  useEffect(() => {
    const courseId = form.watch("course_id");
    if (!courseId) {
      setSections([]);
      setBlocks([]);
      form.setValue("section_id", "");
      form.setValue("block_id", "");
      return;
    }
    setLoadingSections(true);
    fetch(`/api/admin/sections?course_path_id=${courseId}`)
      .then(res => res.json())
      .then(data => {
          setSections(data);
        setLoadingSections(false);
      })
      .catch(() => {
        setErrorSections("Failed to load sections");
        setLoadingSections(false);
      });
  }, [form.watch("course_id")]);

  // Fetch blocks when section changes
  useEffect(() => {
    const sectionId = form.watch("section_id");
    if (!sectionId) {
    setBlocks([]);
    form.setValue("block_id", "");
      return;
    }
    setLoadingBlocks(true);
    fetch(`/api/admin/blocks?section_id=${sectionId}`)
      .then(res => res.json())
      .then(data => {
        setBlocks(data);
        setLoadingBlocks(false);
      })
      .catch(() => {
        setErrorBlocks("Failed to load blocks");
        setLoadingBlocks(false);
      });
  }, [form.watch("section_id")]);



  async function onSubmit(values: ContentItemFormValues) {
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setMessage("Content item created successfully!");
        form.reset();
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to create content item"}`);
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Content Item</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Course Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Course</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start" disabled={loadingCourses}>
                {loadingCourses
                  ? "Loading..."
                  : courses.find(c => c.id === form.watch("course_id"))?.name || "Select a course"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              <DropdownMenuLabel>Pick a course</DropdownMenuLabel>
              {errorCourses && <DropdownMenuItem disabled>{errorCourses}</DropdownMenuItem>}
              {courses.map(course => (
                <DropdownMenuItem key={course.id} onClick={() => form.setValue("course_id", course.id)}>
                  {course.name}
                  </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {form.formState.errors.course_id && <div className="text-red-500 text-sm mt-1">{form.formState.errors.course_id.message}</div>}
        </div>
        {/* Section Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Section</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start" disabled={!form.watch("course_id") || loadingSections}>
                {loadingSections
                  ? "Loading..."
                  : sections.find(s => s.id === form.watch("section_id"))?.title || (!form.watch("course_id") ? "Select a course first" : "Select a section")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              <DropdownMenuLabel>Pick a section</DropdownMenuLabel>
              {errorSections && <DropdownMenuItem disabled>{errorSections}</DropdownMenuItem>}
              {sections.map(section => (
                <DropdownMenuItem key={section.id} onClick={() => form.setValue("section_id", section.id)}>
                    {section.title}
                  </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {form.formState.errors.section_id && <div className="text-red-500 text-sm mt-1">{form.formState.errors.section_id.message}</div>}
        </div>
        {/* Block Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Content Block</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-start" disabled={!form.watch("section_id") || loadingBlocks}>
                {loadingBlocks
                  ? "Loading..."
                  : blocks.find(b => b.id === form.watch("block_id"))?.title || (!form.watch("section_id") ? "Select a section first" : "Select a content block")}
                    </Button>
                  </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[200px]">
              <DropdownMenuLabel>Pick a content block</DropdownMenuLabel>
              {errorBlocks && <DropdownMenuItem disabled>{errorBlocks}</DropdownMenuItem>}
              {blocks.map(block => (
                <DropdownMenuItem key={block.id} onClick={() => form.setValue("block_id", block.id)}>
                  {block.title}
                        </DropdownMenuItem>
              ))}
                  </DropdownMenuContent>
                </DropdownMenu>
          {form.formState.errors.block_id && <div className="text-red-500 text-sm mt-1">{form.formState.errors.block_id.message}</div>}
        </div>
        {/* Content Type Dropdown */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Content Type</label>
          <Select onValueChange={(value) => form.setValue("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text (Rich Content)</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="animation">Animation</SelectItem>
              <SelectItem value="math">Mathematical Formula</SelectItem>
              <SelectItem value="chart">Chart/Graph</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Order Index Input */}
        <div>
          <label className="block font-semibold mb-2">Order Index</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            placeholder="Order Index"
            value={form.watch("order_index") ?? ""}
            onChange={e => form.setValue("order_index", e.target.value === "" ? 0 : parseInt(e.target.value))}
            min={0}
          />
          {form.formState.errors.order_index && <div className="text-red-500 text-sm mt-1">{form.formState.errors.order_index.message}</div>}
        </div>
        {/* Image URL Input */}
        <div>
          <label className="block font-semibold mb-2">Image URL</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="https://example.com/image.jpg"
            value={form.watch("image_url") ?? ""}
            onChange={e => form.setValue("image_url", e.target.value)}
          />
        </div>
        {/* Quiz Data Input */}
        <div>
          <label className="block font-semibold mb-2">Quiz Data (JSON)</label>
          <input
            type="text"
            className="w-full border rounded p-2 font-mono"
            placeholder='{"question": "What is 2+2?", "options": ["3", "4", "5"], "answer": 1}'
            value={form.watch("quiz_data") ?? ""}
            onChange={e => form.setValue("quiz_data", e.target.value)}
          />
        </div>
        {/* Quiz Question Input */}
        <div>
          <label className="block font-semibold mb-2">Quiz Question</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Quiz question (optional)"
            value={form.watch("quiz_question") ?? ""}
            onChange={e => form.setValue("quiz_question", e.target.value)}
          />
        </div>
        {/* Enhanced Content Editor or Chart Editor */}
        {form.watch("type") === "chart" ? (
          <div>
            <label className="block font-semibold mb-2">Chart Configuration</label>
            <ChartEditor
              value={form.watch("content_text") || ""}
              onChange={(value) => form.setValue("content_text", value)}
              placeholder="Configure your chart..."
            />
            {form.formState.errors.content_text && (
              <div className="text-red-500 text-sm mt-1">{form.formState.errors.content_text.message}</div>
            )}
          </div>
        ) : (
          <div>
            <label className="block font-semibold mb-2">Content Text</label>
            <EnhancedContentEditor
              value={form.watch("content_text") || ""}
              onChange={(value) => form.setValue("content_text", value)}
              placeholder="Enter your content here..."
            />
            {form.formState.errors.content_text && (
              <div className="text-red-500 text-sm mt-1">{form.formState.errors.content_text.message}</div>
            )}
          </div>
        )}
        <Button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Submit"}
        </Button>
        {message && <div className="mt-2 text-sm text-center">{message}</div>}
      </form>
    </div>
  );
} 
