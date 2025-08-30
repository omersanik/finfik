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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ExternalLink } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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
      acceptTerms: false,
      acceptPrivacy: false,
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
          <h1 className="text-xl font-bold text-center mb-2">Create Your Account</h1>

          {verifying ? (
            <>
              <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
              {verificationError && (
                <Alert variant="destructive" className="mb-2 w-full">
                  <AlertCircle className="h-4 w-4" />
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
              {/* Social Sign Up Buttons */}
              <div className="flex flex-col gap-1 w-full mb-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 max-w-none flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100 text-base font-medium mx-auto px-2"
                  onClick={async () => {
                    if (!isLoaded) return;
                    
                    // Check if both checkboxes are checked
                    const acceptTerms = form.getValues("acceptTerms");
                    const acceptPrivacy = form.getValues("acceptPrivacy");
                    
                    if (!acceptTerms || !acceptPrivacy) {
                      setAuthError("Please accept both the Terms of Service and Privacy Policy before signing up.");
                      return;
                    }
                    
                    try {
                      await signUp.authenticateWithRedirect({
                        strategy: "oauth_google",
                        redirectUrl: "/",
                        redirectUrlComplete: "/",
                      });
                    } catch (err) {
                      setAuthError(
                        `Google sign-up failed. Please try again. ${err}`
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
                  Sign up with Google
                </Button>
              </div>

              {authError && (
                <Alert variant="destructive" className="mb-3 w-full">
                  <AlertCircle className="h-4 w-4" />
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
                            <Mail className="absolute left-3 top-3.5 h-4 w-4 " />
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
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 " />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
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

                  <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-4 w-4 " />
                            <Input
                              type={showPasswordConfirmation ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                              className="absolute right-3 top-2.5"
                            >
                              {showPasswordConfirmation ? (
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

                  {/* Terms and Privacy Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the{" "}
                              <button
                                type="button"
                                onClick={() => setShowTermsModal(true)}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                              >
                                Terms of Service
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptPrivacy"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the{" "}
                              <button
                                type="button"
                                onClick={() => setShowPrivacyModal(true)}
                                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                              >
                                Privacy Policy
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

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
              {/* CAPTCHA element for Clerk - inside the sign-up card */}
              <div className="flex justify-center mt-4">
                <div id="clerk-captcha"></div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>
              Please read our terms of service carefully before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="text-lg font-semibold mb-2">1. Introduction</h3>
                <p>
                  Welcome to Finfik! These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website finfik.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the &ldquo;Site&rdquo;). Please read these Terms carefully before using the Site. By accessing or using the Site, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Site.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">2. Acceptance of Terms</h3>
                <p>
                  By creating an account, making a purchase, or otherwise accessing or using the Site, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as any additional terms and conditions or policies referenced herein or made available on the Site from time to time.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">3. Access and Use of the Service</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Eligibility:</strong> You must be at least 18 years old or the age of legal majority in your jurisdiction to use the Site.</li>
                  <li><strong>License:</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for your personal, non-commercial use.</li>
                  <li><strong>Restrictions:</strong> You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Site without our express written permission.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">4. User Accounts</h3>
                <p>
                  You may be required to register with the Site to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">5. Intellectual Property</h3>
                <p>
                  All content on the Site, including text, graphics, logos, images, as well as the compilation thereof, and any software used on the Site, is the property of Finfik or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">6. Termination</h3>
                <p>
                  We may terminate or suspend your access to the Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">7. Disclaimers</h3>
                <p>
                  THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">8. Limitation of Liability</h3>
                <p>
                  IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">9. Contact Information</h3>
                <p>
                  If you have any questions about these Terms of Service, please contact us at: <a href="mailto:support@finfik.com" className="text-primary hover:underline">support@finfik.com</a>
                </p>
              </section>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowTermsModal(false)}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              Please read our privacy policy carefully before proceeding.
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="text-lg font-semibold mb-2">1. Introduction</h3>
                <p>
                  Welcome to Finfik! We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website finfik.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the &ldquo;Site&rdquo;). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">2. Information We Collect</h3>
                <p>
                  We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device (&ldquo;personal information&rdquo;).
                </p>
                <h4 className="text-md font-medium mt-3 mb-2">2.1 Personal Information You Disclose to Us</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                  <li><strong>Contact Data:</strong> Billing address, email address, and telephone numbers.</li>
                  <li><strong>Financial Data:</strong> Payment card details (processed securely by third-party payment processors).</li>
                  <li><strong>Profile Data:</strong> Your username and password, purchases or orders made by you, your interests, preferences, feedback, and survey responses.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">3. How We Use Your Information</h3>
                <p>We use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>To provide, operate, and maintain our Site.</li>
                  <li>To improve, personalize, and expand our Site.</li>
                  <li>To understand and analyze how you use our Site.</li>
                  <li>To develop new products, services, features, and functionality.</li>
                  <li>To communicate with you, either directly or through one of our partners.</li>
                  <li>To process your transactions and manage your orders.</li>
                  <li>To find and prevent fraud.</li>
                  <li>For compliance with legal obligations.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">4. How We Share Your Information</h3>
                <p>We may share your information with third parties in the following situations:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service Providers:</strong> We may share your personal information with third-party service providers who perform services on our behalf.</li>
                  <li><strong>Business Transfers:</strong> We may share or transfer your personal information in connection with any merger, sale of company assets, financing, or acquisition.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">5. Your Rights</h3>
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> You have the right to request access to the personal information we hold about you.</li>
                  <li><strong>Correction:</strong> You have the right to request that we correct any inaccurate personal information.</li>
                  <li><strong>Deletion:</strong> You have the right to request the deletion of your personal information.</li>
                  <li><strong>Objection/Restriction:</strong> You have the right to object to or request restriction of our processing of your personal information.</li>
                  <li><strong>Data Portability:</strong> You have the right to request a copy of your personal information in a structured format.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">6. Data Security</h3>
                <p>
                  We implement reasonable technical, administrative, and physical security measures designed to protect your personal information from unauthorized access, use, or disclosure. However, please be aware that no security measures are perfect or impenetrable.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">7. Changes to This Privacy Policy</h3>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Effective Date&rdquo; at the top of this Privacy Policy.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">8. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:support@finfik.com" className="text-primary hover:underline">support@finfik.com</a>
                </p>
              </section>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPrivacyModal(false)}>
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
