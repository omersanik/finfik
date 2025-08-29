"use client";
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
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  order_index: z
    .number()
    .int()
    .min(0, { message: "Order index must be a non-negative integer" }),
});

interface CoursePath {
  id: string;
  name: string;
  slug?: string;
}
interface Section {
  id: string;
  title: string;
}

export default function AddContentBlocks() {
  const [coursePaths, setCoursePaths] = useState<CoursePath[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedCoursePath, setSelectedCoursePath] =
    useState<CoursePath | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorPaths, setErrorPaths] = useState("");
  const [errorSections, setErrorSections] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [latestBlockOrder, setLatestBlockOrder] = useState<number | null>(null);
  const [nextBlockOrder, setNextBlockOrder] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      order_index: 0,
    },
  });

  // Fetch course paths on mount
  useEffect(() => {
    setLoadingPaths(true);
    fetch("/api/admin/course-paths")
      .then((res) => res.json())
      .then((data) => {
        setCoursePaths(data);
        setLoadingPaths(false);
      })
      .catch(() => {
        setErrorPaths("Failed to load course paths");
        setLoadingPaths(false);
      });
  }, []);

  // Fetch sections when course path changes
  useEffect(() => {
    if (!selectedCoursePath) {
      setSections([]);
      setSelectedSection(null);
      return;
    }
    setLoadingSections(true);
    fetch(`/api/admin/sections?course_path_id=${selectedCoursePath.id}`)
      .then((res) => res.json())
      .then((data) => {
        setSections(data);
        setLoadingSections(false);
      })
      .catch(() => {
        setErrorSections("Failed to load sections");
        setLoadingSections(false);
      });
  }, [selectedCoursePath]);

  // Handle course path select
  function handleCoursePathSelect(cp: CoursePath) {
    setSelectedCoursePath(cp);
    setSelectedSection(null);
    setSections([]);
    setErrorSections("");
  }
  // Handle section select
  async function handleSectionSelect(section: Section) {
    setSelectedSection(section);

    // Fetch latest order for this section
    try {
      const response = await fetch(
        `/api/admin/latest-indexes?section_id=${section.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setLatestBlockOrder(data.latestBlockOrder);
        setNextBlockOrder(data.nextBlockOrder);
        form.setValue("order_index", data.nextBlockOrder);
      }
    } catch (error) {
      console.error("Error fetching latest block order:", error);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    setMessage(null);
    if (!selectedCoursePath || !selectedSection) {
      setMessage("Please select both a course path and a section.");
      setSubmitting(false);
      return;
    }
    // Use slug if available, else fallback to name
    const slug = selectedCoursePath.slug || selectedCoursePath.name;
    try {
      const response = await fetch(`/api/courses/${slug}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section_id: selectedSection.id,
          title: values.title,
          order_index: values.order_index,
        }),
      });
      if (response.ok) {
        form.reset();
        setSelectedCoursePath(null);
        setSelectedSection(null);
        setMessage("Content block created successfully!");
      } else {
        const errorData = await response.json();
        setMessage(
          `Error: ${errorData.error || "Failed to create content block"}`
        );
      }
    } catch (error) {
      setMessage(`An unexpected error occurred. Please try again. ${error}`);
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
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={loadingPaths}
              >
                {selectedCoursePath?.name || "Select a course path..."}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {loadingPaths ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : errorPaths ? (
                <DropdownMenuItem disabled>{errorPaths}</DropdownMenuItem>
              ) : coursePaths.length > 0 ? (
                coursePaths.map((cp) => (
                  <DropdownMenuItem
                    key={cp.id}
                    onClick={() => handleCoursePathSelect(cp)}
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
                disabled={!selectedCoursePath || loadingSections}
              >
                {selectedSection?.title ||
                  (!selectedCoursePath
                    ? "Select a course path first"
                    : "Select a section...")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {loadingSections ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : errorSections ? (
                <DropdownMenuItem disabled>{errorSections}</DropdownMenuItem>
              ) : sections.length > 0 ? (
                sections.map((section) => (
                  <DropdownMenuItem
                    key={section.id}
                    onClick={() => handleSectionSelect(section)}
                  >
                    {section.title}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No sections found</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <FormDescription>
            Select the section for this content block.
          </FormDescription>
        </div>
        {/* Title Input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormDescription>The title of the content block.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Order Index Input */}
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
              <FormDescription>
                {latestBlockOrder !== null
                  ? `Latest order: ${latestBlockOrder} | Next available: ${nextBlockOrder}`
                  : "The order in which this content block appears."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {message && (
          <div
            className={`text-sm ${
              message.startsWith("Error") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}
