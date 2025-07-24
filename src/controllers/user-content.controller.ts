import { Response } from "express";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createNewContentSchema } from "../schemas/content.schema";
import { FileType } from "../generated/prisma";
import { generatePdfThumbnailFromS3 } from "../utils/generatePdfThumbnail";

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

    res.send({ success: true, contents });
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

    const file = req.file as Express.MulterS3.File;

    if (!file) {
      res.status(400).json({ success: false, error: "File not found" });
      return;
    }

    const thumbnailUrl = await generatePdfThumbnailFromS3(
      file.bucket,
      file.key
    );

    if (!success) {
      res.status(400).send({
        success,
        error: error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }

    const unitName = await prisma.unit.findFirst({
      where: {
        id: data.unitId,
      },
      select: {
        name: true,
      },
    });

    const content = await prisma.content.create({
      data: {
        title: unitName?.name!,
        description: "",
        imageUrl: thumbnailUrl,
        uploadedBy: req.user?.id!,
        status: false,
        branchId: data.branchId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        unitId: data.unitId,
      },
    });

    const newFile = await prisma.file.create({
      data: {
        name: file.key.split("/")[1],
        url: file.location,
        size: file.size,
        type: FileType.pdf,
        content: {
          connect: {
            id: content.id,
          },
        },
      },
    });

    const updatedContent = await prisma.content.update({
      where: {
        id: content.id,
      },
      data: {
        fileId: newFile.id,
      },
      include: {
        File: true,
      },
    });

    res.status(200).send({
      success: true,
      content: updatedContent,
      message: "Created new content successfully",
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, error: "Failed to create new content" });
  }
}
