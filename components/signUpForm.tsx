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
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import finfiklogo from "@/logo/finfiklogo.svg";
import { signUpSchema } from "@/schemas/signUpSchema";

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
  }, [setTheme]);

  useEffect(() => {
    if (isSignedIn) router.replace("/");
  }, [isSignedIn, router]);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      identifier: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const extractClerkErrorMessage = (error: unknown): string => {
    let message = "An error occurred. Please try again.";

    if (
      typeof error === "object" &&
      error !== null &&
      "errors" in error &&
      Array.isArray(
        (error as { errors?: { message?: string; code?: string }[] }).errors
      )
    ) {
      const firstError = (
        error as { errors?: { message?: string; code?: string }[] }
      ).errors![0];
      if (
        firstError.message?.includes("already exists") ||
        firstError.message?.includes("already registered") ||
        firstError.code === "form_identifier_exists"
      ) {
        message =
          "An account with this email already exists. Please sign in instead.";
      } else if (firstError.message) {
        message = firstError.message;
      }
    }

    return message;
  };

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
    } catch (error: unknown) {
      console.error("Sign-up error:", error);
      setAuthError(extractClerkErrorMessage(error));
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
        setVerificationError(
          "Verification could not be completed. Please try again."
        );
      }
    } catch (error: unknown) {
      console.error("Verification error:", error);

      let message = "An error occurred during verification. Please try again.";

      if (
        typeof error === "object" &&
        error !== null &&
        "errors" in error &&
        Array.isArray((error as { errors?: { message?: string }[] }).errors) &&
        (error as { errors?: { message?: string }[] }).errors![0]?.message
      ) {
        message = (error as { errors?: { message?: string }[] }).errors![0]
          .message!;
      }

      setVerificationError(message);
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

          {verifying ? (
            <>
              <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
              {verificationError && (
                <Alert variant="destructive" className="mb-2 w-full">
                  <AlertTitle className="text-sm">Error</AlertTitle>
                  <AlertDescription className="text-xs">
                    {verificationError}
                  </AlertDescription>
                </Alert>
              )}
              <form
                onSubmit={handleVerificationSubmit}
                className="space-y-2 w-full"
              >
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-sm py-2"
                >
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
                  <AlertDescription className="text-xs">
                    {authError}
                    {authError.includes("already exists") && (
                      <div className="mt-2">
                        <Link
                          href="/sign-in"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Click here to sign in instead
                        </Link>
                      </div>
                    )}
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
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
