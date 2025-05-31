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

export default function SignUpForm() {
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
        router.push("/dashboard");
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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F9FA] px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-1 pt-2">
        <Image
          src={finfiklogo}
          alt="Finfik Logo"
          width={200}
          height={100}
          className="mx-auto"
        />
        <div className="w-full rounded-2xl bg-white p-5 shadow-md border border-[#E5E8EB]">
          {verifying ? (
            <>
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">
                Verify Your Email
              </h2>
              {verificationError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-[#2D2D2D]"
                  autoFocus
                />
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-[#2ECC71] hover:bg-[#27ae60]"
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
              <p className="mt-4 text-sm text-[#2D2D2D]">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={async () => {
                    if (signUp) {
                      await signUp.prepareEmailAddressVerification({
                        strategy: "email_code",
                      });
                    }
                  }}
                  className="text-[#F1C40F] underline"
                >
                  Resend code
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-4">
                Create Your Account
              </h2>
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2D2D2D]">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <FormLabel className="text-[#2D2D2D]">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <FormLabel className="text-[#2D2D2D]">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                    className="w-full bg-[#1ABC9C] hover:bg-[#16a085]"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              <p className="mt-6 text-sm text-center text-[#7F8C8D]">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-[#3498DB] hover:underline font-medium"
                >
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
