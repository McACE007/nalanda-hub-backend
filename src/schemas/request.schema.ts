import z from "zod";

export const createNewRequestSchema = z.object({
  requestType: z.string().nonempty(),
  contentId: z.coerce.number().optional(),
  branchId: z.coerce.number(),
  semesterId: z.coerce.number(),
  subjectId: z.coerce.number(),
  unitId: z.coerce.number(),
});
