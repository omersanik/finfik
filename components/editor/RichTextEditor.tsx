"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import dynamic from "next/dynamic";

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@mantine/rte").then((mod) => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] border rounded-md bg-gray-50 flex items-center justify-center">
        Loading editor...
      </div>
    ),
  }
);

const formSchema = z.object({
  block_id: z.string().optional(),
  type: z.string().optional(),
  content_text: z.string().optional(),
  image_url: z.string().optional(),
  quiz_data: z.string().optional(),
  component_key: z.string().optional(),
  order_index: z
    .preprocess((v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const num = Number(v);
      return isNaN(num) ? undefined : num;
    }, z.number().optional())
    .optional(),
  quiz_question: z.string().optional(),
});

interface ContentBlock {
  id: string;
  title: string;
}

interface CoursePath {
  id: string;
  name: string;
}

interface Section {
  id: string;
  title: string;
}

type ContentItemFormValues = z.infer<typeof formSchema>;

// Custom Rich Text Editor Component
interface CustomRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function CustomRichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 200,
}: CustomRichTextEditorProps) {
  // Additional check to ensure we're on the client side
  if (typeof window === "undefined") {
    return (
      <div className="h-[250px] border rounded-md bg-gray-50 flex items-center justify-center">
        Loading editor...
      </div>
    );
  }

  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ minHeight: `${minHeight}px` }}
      controls={[
        ["bold", "italic", "underline", "strike", "code"],
        ["h1", "h2", "h3", "h4"],
        ["unorderedList", "orderedList"],
        ["alignLeft", "alignCenter", "alignRight"],
        ["link"],
        ["image", "video"],
        ["blockquote"],
        ["sup", "sub"],
        ["clean"],
      ]}
    />
  );
}

export default function AddContentItems() {
  const [coursePaths, setCoursePaths] = useState<CoursePath[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  const [selectedCoursePath, setSelectedCoursePath] = useState<string>("");
  const [selectedCoursePathName, setSelectedCoursePathName] =
    useState<string>("");

  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSectionName, setSelectedSectionName] = useState<string>("");

  const [selectedBlockName, setSelectedBlockName] = useState<string>("");

  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ContentItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      block_id: "",
      type: "",
      content_text: "",
      image_url: "",
      quiz_data: "",
      component_key: "",
      order_index: undefined,
      quiz_question: "",
    },
  });

  // Fetch course paths on mount
  useEffect(() => {
    async function fetchCoursePaths() {
      try {
        const res = await fetch("/api/admin/course-paths");
        if (res.ok) {
          const data = await res.json();
          setCoursePaths(data);
        } else {
          setCoursePaths([]);
        }
      } catch {
        setCoursePaths([]);
      } finally {
        setLoadingPaths(false);
      }
    }
    fetchCoursePaths();
  }, []);

  // Fetch sections when course path changes
  useEffect(() => {
    if (!selectedCoursePath) return;

    setLoadingSections(true);
    setSections([]);
    setSelectedSection("");
    setSelectedSectionName("");
    setBlocks([]);
    setSelectedBlockName("");
    form.setValue("block_id", "");

    async function fetchSections() {
      try {
        const res = await fetch(
          `/api/admin/sections?course_path_id=${selectedCoursePath}`
        );
        if (res.ok) {
          const data = await res.json();
          setSections(data);
        } else {
          setSections([]);
        }
      } catch {
        setSections([]);
      } finally {
        setLoadingSections(false);
      }
    }
    fetchSections();
  }, [selectedCoursePath, form]);

  // Fetch blocks when section changes
  useEffect(() => {
    if (!selectedSection) return;

    setLoadingBlocks(true);
    setBlocks([]);
    setSelectedBlockName("");
    form.setValue("block_id", "");

    async function fetchBlocks() {
      try {
        const res = await fetch(
          `/api/admin/blocks?section_id=${selectedSection}`
        );
        if (res.ok) {
          const data = await res.json();
          setBlocks(data || []);
        } else {
          setBlocks([]);
        }
      } catch {
        setBlocks([]);
      } finally {
        setLoadingBlocks(false);
      }
    }
    fetchBlocks();
  }, [selectedSection, form]);

  function handleCoursePathSelect(id: string, name: string) {
    setSelectedCoursePath(id);
    setSelectedCoursePathName(name);
  }

  function handleSectionSelect(id: string, name: string) {
    setSelectedSection(id);
    setSelectedSectionName(name);
  }

  function handleBlockSelect(id: string, title: string) {
    setSelectedBlockName(title);
    form.setValue("block_id", id);
  }

  async function onSubmit(values: ContentItemFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/content-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        form.reset();
        setSelectedBlockName("");
        alert("Content item created successfully!");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || "Failed to create content item"}`);
      }
    } catch {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Course Path Dropdown */}
        <div>
          <FormLabel>Course Path</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedCoursePathName || "Select a course path..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-60 overflow-auto">
              {loadingPaths ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : coursePaths.length > 0 ? (
                coursePaths.map((cp) => (
                  <DropdownMenuItem
                    key={cp.id}
                    onClick={() => handleCoursePathSelect(cp.id, cp.name)}
                  >
                    {cp.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No course paths found
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <FormDescription>Select the course path.</FormDescription>
        </div>

        {/* Section Dropdown */}
        <div>
          <FormLabel>Section</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={!selectedCoursePath}
              >
                {selectedSectionName || "Select a section..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full max-h-60 overflow-auto">
              {loadingSections ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : sections.length > 0 ? (
                sections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onClick={() =>
                      handleSectionSelect(section.id, section.title)
                    }
                  >
                    {section.title}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No sections found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <FormDescription>Select the section.</FormDescription>
        </div>

        {/* Content Block Dropdown */}
        <FormField
          control={form.control}
          name="block_id"
          render={() => (
            <FormItem>
              <FormLabel>Content Block</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      disabled={!selectedSection}
                    >
                      {selectedBlockName || "Select a content block..."}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-60 overflow-auto">
                    {loadingBlocks ? (
                      <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : blocks.length > 0 ? (
                      blocks.map((block) => (
                        <DropdownMenuItem
                          key={block.id}
                          onClick={() =>
                            handleBlockSelect(block.id, block.title)
                          }
                        >
                          {block.title || block.id}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No content blocks found
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>
              <FormDescription>
                Select the content block for this item (optional).
              </FormDescription>
              <FormMessage />
              {/* Debug block list */}
              {!loadingBlocks && blocks.length > 0 && (
                <pre className="mt-2 p-2 bg-gray-100 text-xs rounded border overflow-x-auto max-h-40">
                  {JSON.stringify(blocks, null, 2)}
                </pre>
              )}
            </FormItem>
          )}
        />

        {/* Type Input */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type (e.g. text, image, quiz, animation)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Type of content item (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Text (Custom Rich Text Editor) */}
        <FormField
          control={form.control}
          name="content_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Text (Rich)</FormLabel>
              <FormControl>
                <CustomRichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Enter your content here..."
                  minHeight={250}
                />
              </FormControl>
              <FormDescription>
                Use the rich text editor for formatting, images, tables, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image URL */}
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Image URL" {...field} />
              </FormControl>
              <FormDescription>Image URL (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quiz Data */}
        <FormField
          control={form.control}
          name="quiz_data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Data</FormLabel>
              <FormControl>
                <Input placeholder="Quiz Data (JSON)" {...field} />
              </FormControl>
              <FormDescription>
                Quiz data in JSON format (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Component Key */}
        <FormField
          control={form.control}
          name="component_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Component Key</FormLabel>
              <FormControl>
                <Input placeholder="Component Key" {...field} />
              </FormControl>
              <FormDescription>Component key (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order Index */}
        <FormField
          control={form.control}
          name="order_index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Index</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Order Index"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === ""
                        ? undefined
                        : parseInt(e.target.value)
                    )
                  }
                />
              </FormControl>
              <FormDescription>Order index (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quiz Question */}
        <FormField
          control={form.control}
          name="quiz_question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Question</FormLabel>
              <FormControl>
                <Input placeholder="Quiz Question" {...field} />
              </FormControl>
              <FormDescription>Quiz question (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
