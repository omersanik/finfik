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
    <div className="flex min-h-screen items-center justify-center  px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-1 pt-2">
        <Image
          src={finfiklogo}
          alt="Finfik Logo"
          width={200}
          height={100}
          className="mx-auto"
        />

        <div className="w-full rounded-2xl">
          {verifying ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
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
                  autoFocus
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
              <p className="mt-4 text-sm ">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={async () => {
                    if (signUp) {
                      await signUp.prepareEmailAddressVerification({
                        strategy: "email_code",
                      });
                    }
                  }}
                  className=" underline"
                >
                  Resend code
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Create Your Account</h2>
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
                    className="w-full"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
              <p className="mt-6 text-sm text-center">
                Already have an account?{" "}
                <Link href="/sign-in" className=" hover:underline font-medium">
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
