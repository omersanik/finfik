import { z } from "zod";

export const signUpSchema = z
  .object({
    identifier: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password should be minumum 8 characters" }),
    passwordConfirmation: z
      .string()
      .min(1, { message: "Please confirm your password" })
      .min(8, { message: "Password should be minumum 8 characters" }),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, { message: "You must accept the Terms of Service" }),
    acceptPrivacy: z
      .boolean()
      .refine((val) => val === true, { message: "You must accept the Privacy Policy" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match!",
    path: ["passwordConfirmation"],
  });
