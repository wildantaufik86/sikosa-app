import { z } from "zod";

const emailSchema = z.string().email().min(1).max(255);
const usernameSchema = z.string().min(6).max(10);
const passwordSchema = z.string().min(6).max(255);

export const loginSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6).max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do Not Match",
    path: ["Confirm Password"],
  });
