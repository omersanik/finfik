"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import Image from "next/image";
import finfiklogo from "@/logo/finfiklogo.svg";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInSchema } from "@/schemas/signInSchema";
import { useTheme } from "next-themes";

export default function SignInForm() {
  const { setTheme } = useTheme();

  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { isSignedIn } = useAuth();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    setTheme("light");
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn.create({
        identifier: data.identifier,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.error("Sign-in incomplete:", result);
        setAuthError("Sign-in could not be completed. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Sign-in error:", error);

      let errorMessage = "An error occurred during sign-in. Please try again.";

      // Narrow the error type safely
      if (
        typeof error === "object" &&
        error !== null &&
        "errors" in error &&
        Array.isArray((error as { errors?: { message?: string }[] }).errors) &&
        (error as { errors?: { message?: string }[] }).errors![0]?.message
      ) {
        errorMessage = (error as { errors?: { message?: string }[] }).errors![0]
          .message!;
      }

      // Check if it's a "not found" error and suggest signing up
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("doesn't exist") ||
        errorMessage.toLowerCase().includes("no account")
      ) {
        setAuthError(
          "No account found with this email. Please sign up instead."
        );
      } else {
        setAuthError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-2">
      <div className="w-full max-w-lg">
        <div className="bg-card shadow-lg rounded-2xl p-6 flex flex-col items-center gap-1">
          <div className="w-40 h-16 overflow-hidden flex items-center justify-center rounded mb-2">
            <Image
              src={finfiklogo}
              alt="Finfik Logo"
              width={200}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Welcome Back</h1>

          {/* Social Sign In Buttons */}
          <div className="flex flex-col gap-1 w-full mb-2">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 max-w-none flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100 text-base font-medium mx-auto px-2"
              onClick={async () => {
                if (!isLoaded) return;
                try {
                  await signIn.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: "/",
                    redirectUrlComplete: "/",
                  });
                } catch (err) {
                  setAuthError(
                    `Google sign-in failed. Please try again. ${err}`
                  );
                }
              }}
            >
              <span className="flex items-center justify-center w-5 h-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                  className=""
                  style={{ display: "block" }}
                >
                  <g>
                    <path
                      fill="#4285F4"
                      d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.4 2.69 13.32l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.67 28.13a14.5 14.5 0 0 1 0-8.26l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.53l7.98-6.4z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 48c6.45 0 11.86-2.13 15.81-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.62 2.16-6.38 0-11.87-3.59-14.33-8.79l-7.98 6.4C6.73 42.6 14.82 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </g>
                </svg>
              </span>
              Sign in with Google
            </Button>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-3 w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Error</AlertTitle>
              <AlertDescription className="text-xs">
                {authError}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 w-full"
            >
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 " />
                        <Input
                          {...field}
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 " />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-sm py-2"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="mt-3 text-xs text-center w-full">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
