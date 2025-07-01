import z from "zod";
import { RequestType } from "../generated/prisma";

export const createNewRequestSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(30).max(255),
  requestType: z.enum([...Object.values(RequestType)] as [
    RequestType,
    ...RequestType[]
  ]),
  contentId: z.number(),
  branchId: z.number(),
  semesterId: z.number(),
  subjectId: z.number(),
  unitId: z.number(),
});
