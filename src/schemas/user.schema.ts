import z from "zod";

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(16),
});

export const registerUserSchema = z.object({
  fullName: z.string().min(10).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(16),
  confirmPassword: z.string().min(8).max(16),
  branchId: z.number(),
});
