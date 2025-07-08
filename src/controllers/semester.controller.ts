import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../db";
import { Response } from "express";

export async function fetchAllSemester(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { branchId } = req.user!;

    const semesters = await prisma.semester.findMany({
      where: {
        branchId,
      },
      select: {
        name: true,
        id: true,
      },
    });
    res.status(200).json({ success: true, semesters });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch all semesters" });
  }
}
