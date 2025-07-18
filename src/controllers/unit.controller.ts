import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../db";
import { Response } from "express";

export async function fetchAllUnits(req: AuthenticatedRequest, res: Response) {
  try {
    const subjectId =
      typeof req.query.subject === "string" &&
      req.query.subject !== "all" &&
      req.query.subject !== ""
        ? Number(req.query.subject)
        : undefined;
    const units = await prisma.unit.findMany({
      where: {
        subjectId,
      },
      select: {
        name: true,
        id: true,
      },
    });
    res.status(200).json({ success: true, units });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch all units" });
  }
}
