"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import { MessageSquare, Send, CheckCircle, Sparkles, Bug, Lightbulb, Palette, BookOpen, Zap, Settings } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  category: z.enum(["bug", "feature", "ui", "content", "performance", "other"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;



const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function BetaFeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "feature",
      title: "",
      description: "",
      priority: "medium",
      email: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/beta/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Thank you for your feedback! We'll review it soon.");
        form.reset();
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-6">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <Badge variant="secondary" className="bg-green-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Beta
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Feedback Submitted!</h3>
              <p className="text-green-700 text-lg">
                Thank you for helping us improve Finfik! Your feedback is valuable to us.
              </p>
            </div>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              size="lg"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Submit Another Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-md">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Beta Feedback Form
          </CardTitle>
          <CardDescription className="text-lg text-purple-700">
            Help us improve Finfik by sharing your thoughts, reporting bugs, or suggesting new features.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent mx-6" />

      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-purple-800">
                      Category
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/70 border-purple-200 focus:border-purple-400">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug" className="flex items-center gap-2">
                          <Bug className="w-4 h-4" />
                          Bug Report
                        </SelectItem>
                        <SelectItem value="feature" className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Feature Request
                        </SelectItem>
                        <SelectItem value="ui" className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          UI/UX Feedback
                        </SelectItem>
                        <SelectItem value="content" className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Content Feedback
                        </SelectItem>
                        <SelectItem value="performance" className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Performance Issue
                        </SelectItem>
                        <SelectItem value="other" className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-purple-800">
                      Priority
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/70 border-purple-200 focus:border-purple-400">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <Badge variant="outline" className={cn("mr-2", priorityColors.low)}>
                            Low
                          </Badge>
                          Low Priority
                        </SelectItem>
                        <SelectItem value="medium">
                          <Badge variant="outline" className={cn("mr-2", priorityColors.medium)}>
                            Medium
                          </Badge>
                          Medium Priority
                        </SelectItem>
                        <SelectItem value="high">
                          <Badge variant="outline" className={cn("mr-2", priorityColors.high)}>
                            High
                          </Badge>
                          High Priority
                        </SelectItem>
                        <SelectItem value="critical">
                          <Badge variant="outline" className={cn("mr-2", priorityColors.critical)}>
                            Critical
                          </Badge>
                          Critical Priority
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-purple-800">
                    Title
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of your feedback..."
                      className="bg-white/70 border-purple-200 focus:border-purple-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-purple-800">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide detailed information about your feedback, including steps to reproduce if it's a bug report..."
                      className="min-h-[120px] bg-white/70 border-purple-200 focus:border-purple-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email (Optional) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-purple-800">
                    Contact Email (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com"
                      className="bg-white/70 border-purple-200 focus:border-purple-400"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
