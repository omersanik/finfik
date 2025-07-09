"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import finfiklogo from "@/logo/finfiklogo.svg";

import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useTheme } from "next-themes";

export default function SignUpForm() {
  const { setTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setTheme("light");
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.identifier,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (error: any) {
      console.error("Sign-up error:", error);
      setAuthError(
        error.errors?.[0]?.message ||
          "An error occurred during sign-up. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsSubmitting(true);
    setVerificationError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.error("Verification incomplete:", result);
        setVerificationError(
          "Verification could not be completed. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "An error occurred during verification. Please try again."
      );
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
          {/* Social Sign Up Buttons */}
          <div className="flex flex-col gap-1 w-full mb-2">
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 max-w-none flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100 text-base font-medium mx-auto px-2"
              onClick={async () => {
                if (!isLoaded) return;
                try {
                  await signUp.authenticateWithRedirect({ strategy: "oauth_google", redirectUrl: "/", redirectUrlComplete: "/" });
                } catch (err) {
                  setAuthError("Google sign-up failed. Please try again.");
                }
              }}
            >
              <span className="flex items-center justify-center w-5 h-5">
                <svg width="20" height="20" viewBox="0 0 48 48" className="" style={{ display: 'block' }}><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C36.13 2.36 30.45 0 24 0 14.82 0 6.73 5.4 2.69 13.32l7.98 6.19C12.13 13.09 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.13a14.5 14.5 0 0 1 0-8.26l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.77.9 7.34 2.69 10.53l7.98-6.4z"/><path fill="#EA4335" d="M24 48c6.45 0 11.86-2.13 15.81-5.81l-7.19-5.6c-2.01 1.35-4.59 2.16-8.62 2.16-6.38 0-11.87-3.59-14.33-8.79l-7.98 6.4C6.73 42.6 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              </span>
              Sign up with Google
            </Button>
          </div>
          {verifying ? (
            <>
              <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
              {verificationError && (
                <Alert variant="destructive" className="mb-2 w-full">
                  <AlertTitle className="text-sm">Error</AlertTitle>
                  <AlertDescription className="text-xs">{verificationError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleVerificationSubmit} className="space-y-2 w-full">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  autoFocus
                />
                <Button type="submit" disabled={isSubmitting} className="w-full text-sm py-2">
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
              <p className="mt-2 text-xs w-full text-center">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={async () => {
                    if (signUp) {
                      await signUp.prepareEmailAddressVerification({
                        strategy: "email_code",
                      });
                    }
                  }}
                  className="underline"
                >
                  Resend code
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">Create Your Account</h2>
              {authError && (
                <Alert variant="destructive" className="mb-2 w-full">
                  <AlertTitle className="text-sm">Error</AlertTitle>
                  <AlertDescription className="text-xs">{authError}</AlertDescription>
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
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                            <Input
                              placeholder="your.email@example.com"
                              {...field}
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
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
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
                    name="passwordConfirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="pl-10"
                            />
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
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              <p className="mt-3 text-xs text-center w-full">
                Already have an account?{" "}
                <Link href="/sign-in" className="hover:underline font-medium">
                  Sign in
                </Link>{" "}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
