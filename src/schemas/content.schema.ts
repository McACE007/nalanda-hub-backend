import z from "zod";

export const createNewContentSchema = z.object({
  // title: z.string().min(10).max(100),
  // description: z.string().min(30).max(255),
  branchId: z.coerce.number(),
  semesterId: z.coerce.number(),
  subjectId: z.coerce.number(),
  unitId: z.coerce.number(),
  // relatedVideos: z.array(z.string()),
});

export const updateContentSchema = z.object({
  branchId: z.coerce.number(),
  semesterId: z.coerce.number(),
  subjectId: z.coerce.number(),
  unitId: z.coerce.number(),
});
