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

const formSchema = z.object({
  block_id: z.string().optional(),
  type: z.string().optional(),
  content_text: z.string().optional(),
  image_url: z.string().optional(),
  quiz_data: z.string().optional(),
  component_key: z.string().optional(),
  order_index: z.preprocess(
    (v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const num = Number(v);
      return isNaN(num) ? undefined : num;
    },
    z.number().optional()
  ),
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

type ContentItemFormValues = {
  block_id?: string;
  type?: string;
  content_text?: string;
  image_url?: string;
  quiz_data?: string;
  component_key?: string;
  order_index?: any;
  quiz_question?: string;
};

export default function AddContentItems() {
  const [coursePaths, setCoursePaths] = useState<CoursePath[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedCoursePath, setSelectedCoursePath] = useState<string>("");
  const [selectedCoursePathName, setSelectedCoursePathName] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSectionName, setSelectedSectionName] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
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
    const fetchCoursePaths = async () => {
      try {
        const response = await fetch("/api/admin/course-paths");
        if (response.ok) {
          const data = await response.json();
          setCoursePaths(data);
        } else {
          setCoursePaths([]);
        }
      } catch (error) {
        setCoursePaths([]);
      } finally {
        setLoadingPaths(false);
      }
    };
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
    setSelectedBlock("");
    setSelectedBlockName("");
    form.setValue("block_id", "");
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/admin/sections?course_path_id=${selectedCoursePath}`);
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        } else {
          setSections([]);
        }
      } catch (error) {
        setSections([]);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchSections();
  }, [selectedCoursePath]);

  // Fetch blocks when section changes
  useEffect(() => {
    if (!selectedSection) return;
    setLoadingBlocks(true);
    setBlocks([]);
    setSelectedBlock("");
    setSelectedBlockName("");
    form.setValue("block_id", "");
    // Find the course path slug (use name as fallback)
    const cp = coursePaths.find((c) => c.id === selectedCoursePath);
    const slug = (cp as any)?.slug || cp?.name;
    if (!slug) {
      setLoadingBlocks(false);
      return;
    }
    const fetchBlocks = async () => {
      try {
        const response = await fetch(`/api/courses/${slug}/blocks?section_id=${selectedSection}`);
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocks || []);
        } else {
          setBlocks([]);
        }
      } catch (error) {
        setBlocks([]);
      } finally {
        setLoadingBlocks(false);
      }
    };
    fetchBlocks();
  }, [selectedSection, selectedCoursePath, coursePaths]);

  function handleCoursePathSelect(id: string, name: string) {
    setSelectedCoursePath(id);
    setSelectedCoursePathName(name);
  }
  function handleSectionSelect(id: string, name: string) {
    setSelectedSection(id);
    setSelectedSectionName(name);
  }
  function handleBlockSelect(id: string, title: string) {
    setSelectedBlock(id);
    setSelectedBlockName(title);
    form.setValue("block_id", id);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/content-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        form.reset();
        setSelectedBlock("");
        setSelectedBlockName("");
        alert("Content item created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to create content item"}`);
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Course Path Dropdown (not a FormField) */}
        <div>
          <FormLabel>Course Path</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedCoursePathName || "Select a course path..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
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
                <DropdownMenuItem disabled>No course paths found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <FormDescription>Select the course path.</FormDescription>
        </div>
        {/* Section Dropdown (not a FormField) */}
        <div>
          <FormLabel>Section</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start" disabled={!selectedCoursePath}>
                {selectedSectionName || "Select a section..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {loadingSections ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : sections.length > 0 ? (
                sections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onClick={() => handleSectionSelect(section.id, section.title)}
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
        {/* Block Dropdown */}
        <FormField
          control={form.control}
          name="block_id"
          render={() => (
            <FormItem>
              <FormLabel>Content Block</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" disabled={!selectedSection}>
                      {selectedBlockName || "Select a content block..."}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {loadingBlocks ? (
                      <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : blocks.length > 0 ? (
                      blocks.map((block) => (
                        <DropdownMenuItem
                          key={block.id}
                          onClick={() => handleBlockSelect(block.id, block.title)}
                        >
                          {block.title || block.id}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No content blocks found</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>
              <FormDescription>Select the content block for this item (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input placeholder="Type (e.g. text, image, quiz, animation)" {...field} />
              </FormControl>
              <FormDescription>Type of content item (optional).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Content Text */}
        <FormField
          control={form.control}
          name="content_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Text</FormLabel>
              <FormControl>
                <Input placeholder="Content Text" {...field} />
              </FormControl>
              <FormDescription>Text content (optional).</FormDescription>
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
              <FormDescription>Quiz data in JSON format (optional).</FormDescription>
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
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
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