import { Response } from "express";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createNewContentSchema } from "../schemas/content.schema";

export async function getMyContentById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const contentId = Number(req.params.contentId);

    const content = await prisma.content.findUnique({
      where: {
        uploadedBy: req.user?.id,
        id: contentId,
      },
    });

    if (!content) {
      res.status(404).send({ success: false, error: "Content not found" });
      return;
    }
    res.status(200).send({ success: true, content });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: "Failed to fetch content",
    });
  }
}

export async function getAllMyContents(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const contents = await prisma.content.findMany({
      where: {
        uploadedBy: req.user?.id,
      },
    });

    res.send({ success: false, contents });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, message: "Failed to fetch all contents" });
  }
}

export async function createNewContent(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { success, error, data } = createNewContentSchema.safeParse(req.body);

    if (!success) {
      res.status(400).send({ success, error });
      return;
    }

    const content = await prisma.content.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: "",
        uploadedBy: req.user?.id!,
        status: false,
        branchId: data.branchId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        unitId: data.unitId,
      },
    });

    res.status(200).send({
      success: true,
      content,
      message: "Created new content successfully",
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, error: "Failed to create new content" });
  }
}
