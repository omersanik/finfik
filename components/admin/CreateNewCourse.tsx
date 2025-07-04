"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  thumbnail_url: z.string().optional(),
  is_premium_course: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateNewCourse() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      thumbnail_url: "",
      is_premium_course: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const response = await fetch("/api/admin/create-new-course", {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + (errorData.error || "Something went wrong"));
        return;
      }

      alert("Course created successfully!");
      form.reset();
    } catch (error) {
      alert("Network error: " + error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Course Title" {...field} />
              </FormControl>
              <FormDescription>
                This is the title of your course.
              </FormDescription>
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
                <Input placeholder="Course Description" {...field} />
              </FormControl>
              <FormDescription>
                This is a brief description of your course.
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
                <Input placeholder="course-slug" {...field} />
              </FormControl>
              <FormDescription>
                This is the URL-friendly version of your course title.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/thumbnail.jpg"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is the URL of the thumbnail image for your course.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_premium_course"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is Premium Course?</FormLabel>
                <FormDescription>
                  Check this box if your course is a premium course.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
