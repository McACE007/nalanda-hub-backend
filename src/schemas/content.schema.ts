import z from "zod";

export const createNewContentSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(30).max(255),
  branchId: z.number(),
  semesterId: z.number(),
  subjectId: z.number(),
  unitId: z.number(),
  relatedVideos: z.array(z.string()),
});
