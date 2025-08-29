"use client";

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

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";

// Interface for course path data
interface CoursePath {
  id: string;
  name: string;
}

const formSchema = z.object({
  course_path: z.string().min(1, { message: "Course Path ID is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  lessons: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Invalid JSON",
    }
  ),
  order: z.number(),
  slug: z.string().min(1, { message: "Slug is required" }),
});

const AddSections = () => {
  const [coursePaths, setCoursePaths] = useState<CoursePath[]>([]);
  const [selectedCoursePath, setSelectedCoursePath] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestOrder, setLatestOrder] = useState<number | null>(null);
  const [nextOrder, setNextOrder] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      course_path: "",
      title: "",
      description: "",
      lessons: "",
      order: 0,
      slug: "",
    },
  });

  // Fetch course paths on component mount
  useEffect(() => {
    const fetchCoursePaths = async () => {
      try {
        const response = await fetch("/api/admin/course-paths");
        if (response.ok) {
          const data = await response.json();
          setCoursePaths(data);
        } else {
          console.error("Failed to fetch course paths");
        }
      } catch (error) {
        console.error("Error fetching course paths:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursePaths();
  }, []);

  // Handle course path selection
  const handleCoursePathSelect = async (
    coursePathId: string,
    coursePathName: string
  ) => {
    setSelectedCoursePath(coursePathName);
    form.setValue("course_path", coursePathId);

    // Fetch latest order for this course path
    try {
      const response = await fetch(
        `/api/admin/latest-indexes?course_path_id=${coursePathId}`
      );
      if (response.ok) {
        const data = await response.json();
        setLatestOrder(data.latestSectionOrder);
        setNextOrder(data.nextSectionOrder);
        form.setValue("order", data.nextSectionOrder);
      }
    } catch (error) {
      console.error("Error fetching latest order:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Section created successfully:", data);

        // Reset form after successful submission
        form.reset();
        setSelectedCoursePath("");

        // You can add a success toast/notification here
        alert("Section created successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to create section:", errorData);

        // You can add an error toast/notification here
        alert(`Error: ${errorData.error || "Failed to create section"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="course_path"
          render={() => (
            <FormItem>
              <FormLabel>Course Path</FormLabel>
              <FormControl>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {selectedCoursePath || "Select a course path..."}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {loading ? (
                      <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : coursePaths.length > 0 ? (
                      coursePaths.map((coursePath) => (
                        <DropdownMenuItem
                          key={coursePath.id}
                          onClick={() =>
                            handleCoursePathSelect(
                              coursePath.id,
                              coursePath.name
                            )
                          }
                        >
                          {coursePath.name}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>
                        No course paths found
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </FormControl>
              <FormDescription>
                Select the course path where this section will be added.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormDescription>Enter the title of the section.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="description" {...field} />
              </FormControl>
              <FormDescription>
                Enter a brief description of the section.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lessons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lessons</FormLabel>
              <FormControl>
                <Input placeholder="Lessons" {...field} />
              </FormControl>
              <FormDescription>
                Enter the lessons in JSON format. Example: [&quot;Lesson
                1&quot;, &quot;Lesson 2&quot;]
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input
                  placeholder="Order"
                  type="number"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                {latestOrder !== null
                  ? `Latest order: ${latestOrder} | Next available: ${nextOrder}`
                  : "Enter the order number for this section."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="Slug" {...field} />
              </FormControl>
              <FormDescription>
                Enter a unique slug for the section.
              </FormDescription>
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
};

export default AddSections;
