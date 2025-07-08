import { Request, Response } from "express";
import { prisma } from "../db";

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
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "";
    const semesterId = Number(req.query.semester);

    const orderByMap: { [key: string]: any } = {
      newest: { uploadedDate: "desc" },
      oldest: { uploadedDate: "asc" },
      "a-z": { title: "asc" },
      "z-a": { title: "desc" },
    };

    console.log(semesterId, "id");

    const contents = await prisma.content.findMany({
      where: {
        status: true,
        ...(semesterId ? { semesterId } : {}),
        title: {
          contains: search as string,
          mode: "insensitive",
        },
      },
      orderBy: orderByMap[sortBy as string] || "",
    });

    console.log(contents);

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
