import { Request, Response } from "express";
import { prisma } from "../db";

export async function getContent(req: Request, res: Response) {
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
    const contents = await prisma.content.findMany({
      where: {
        status: true,
      },
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
