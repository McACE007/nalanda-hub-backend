import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "../generated/prisma";

export async function getContentById(req: Request, res: Response) {
  try {
    const contentId = Number(req.params.contentId);

    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        status: true,
      },
      include: {
        File: true,
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        error: "Content not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      content,
      message: "Fetched content successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Failed to fetch content" });
  }
}

export async function getALlContents(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";
    const semesterId = req.query.semester
      ? Number(req.query.semester)
      : undefined;
    const subjectId = req.query.subject ? Number(req.query.subject) : undefined;
    const unitId = req.query.unit ? Number(req.query.unit) : undefined;

    const orderByMap: {
      [key: string]: Prisma.ContentOrderByWithRelationInput;
    } = {
      newest: { uploadedDate: "desc" },
      oldest: { uploadedDate: "asc" },
      "a-z": { title: "asc" },
      "z-a": { title: "desc" },
    };

    const contents = await prisma.content.findMany({
      where: {
        status: true,
        semesterId,
        unitId,
        subjectId,
        title: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      orderBy: orderByMap[sortBy],
    });

    res.status(200).json({
      success: true,
      contents,
      message: "Fetched all contents successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to fetch all contents" });
  }
}
