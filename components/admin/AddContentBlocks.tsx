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

const formSchema = z.object({
  section_name: z.string().min(1, {
    message: "Section ID is required",
  }),
  title: z.string(),
  order_index: z.number().int().min(0, {
    message: "Order index must be a non-negative integer",
  }),
});

export default function AddContentBlocks() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      section_name: "",
      title: "",
      order_index: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="section_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Section Name</FormLabel>
              <FormControl>
                <Input placeholder="Section Name" {...field} />
              </FormControl>
              <FormDescription>
                The name of the section to which this content block belongs.
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
              <FormDescription>The title of the content block.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="order_index"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Index</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Order Index" {...field} />
              </FormControl>
              <FormDescription>
                The order in which this content block appears.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
