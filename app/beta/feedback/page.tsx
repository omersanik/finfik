import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BetaFeedbackForm from "@/components/BetaFeedbackForm";
import { createSupabaseServerClient } from "@/supabase-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, Heart } from "lucide-react";

export default async function BetaFeedbackPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    console.log("=== BETA FEEDBACK JWT AUTHENTICATION ===");
    console.log("userId from auth():", userId);

    // Create JWT-authenticated Supabase client
    const supabase = await createSupabaseServerClient();

    // Check if user is a beta user using JWT + explicit user filtering
    const { data: user, error } = await supabase
      .from("users")
      .select("role, name")
      .eq("clerk_id", userId)
      .single();

    console.log("JWT user query result:", { user, error, userId });

    if (error || !user || user.role !== "beta") {
      console.log("Beta feedback page - Access denied:", {
        error: error?.message,
        userRole: user?.role,
        userId,
      });
      redirect("/");
    }

    console.log("Beta feedback access granted for user:", user.name);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <MessageSquare className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3">
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Beta
                    </Badge>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Beta User Feedback
              </h1>

              <p className="text-xl text-purple-700 max-w-3xl mx-auto leading-relaxed">
                Help us improve Finfik! As a beta user, your feedback is
                invaluable in shaping the future of our platform.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="border-2 border-purple-200 bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Exclusive Access
                  </h3>
                  <p className="text-sm text-purple-600">
                    You&apos;re part of our exclusive beta program with premium
                    features
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-200 bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-pink-800 mb-2">
                    Direct Impact
                  </h3>
                  <p className="text-sm text-pink-600">
                    Your feedback directly shapes the future of Finfik
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-white/70 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-800 mb-2">
                    We Value You
                  </h3>
                  <p className="text-sm text-purple-600">
                    Every piece of feedback helps us create a better experience
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Form */}
            <BetaFeedbackForm />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Beta feedback page error:", error);
    redirect("/");
  }
}
