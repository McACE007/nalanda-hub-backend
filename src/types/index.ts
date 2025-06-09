import z from "zod";

export const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(16),
});

export const RegisterRequest = z.object({
  fullName: z.string().min(10).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(16),
  confirmPassword: z.string().min(8).max(16),
  branchId: z.number(),
});

export const CreateContentRequest = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(30).max(255),
  branchId: z.number(),
  semesterId: z.number(),
  subjectId: z.number(),
  unitId: z.number(),
  relatedVideos: z.array(z.string()),
});
