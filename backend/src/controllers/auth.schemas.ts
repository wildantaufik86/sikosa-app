import { z } from "zod";

const emailSchema = z.string().email().min(1).max(255);
const nimSchema = z.string().min(6).max(10);
const passwordSchema = z.string().min(6).max(255);
const profileSchema = z
  .object({
    picture: z.string().optional().default(""),
    fullname: z.string().optional().default(""),
  })
  .default({ picture: "", fullname: "" });
const roleSchema = z
  .enum(["mahasiswa", "psikolog", "admin"])
  .default("mahasiswa");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6).max(255),
    nim: nimSchema,
    profile: profileSchema,
    role: roleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password do Not Match",
    path: ["Confirm Password"],
  });
