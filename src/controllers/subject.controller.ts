import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import prisma from "../db";
import { Response } from "express";

export async function fetchAllSubjects(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const semesterId =
      typeof req.query.semester === "string" && req.query.semester !== "all"
        ? Number(req.query.semester)
        : undefined;
    const subjects = await prisma.subject.findMany({
      where: {
        semesterId: semesterId,
      },
      select: {
        name: true,
        id: true,
      },
    });
    res.status(200).json({ success: true, subjects });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch all subjects" });
  }
}
