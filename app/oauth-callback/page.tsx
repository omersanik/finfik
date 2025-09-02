"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect after OAuth completion
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 relative">
            <Image
              src="/logo-light.png"
              alt="Finfik"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              alt="Finfik"
              fill
              className="object-contain hidden dark:block"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">
              Welcome to Finfik
            </h1>
            <p className="text-muted-foreground">
              Successfully signed in! Redirecting...
            </p>
          </div>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
