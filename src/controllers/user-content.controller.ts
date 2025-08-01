import { Response } from "express";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createNewContentSchema } from "../schemas/content.schema";
import { FileType, RequestType } from "../generated/prisma";
import { generatePdfThumbnailFromS3 } from "../utils/generatePdfThumbnail";
import { deleteFileFromS3 } from "../utils/deleteFileFromS3";
import { userInfo } from "os";

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

export async function deleteContent(req: AuthenticatedRequest, res: Response) {
  try {
    const contentId = Number(req.params.contentId);

    const existingContent = await prisma.content.findUnique({
      where: {
        id: contentId,
      },
      include: {
        File: true,
      },
    });

    if (!existingContent) {
      res.status(404).json({ success: false, error: "Content not found" });
      return;
    }

    deleteFileFromS3({
      bucket: "nalanda-hub",
      key: `uploads/${existingContent.File?.name}`,
    });

    deleteFileFromS3({
      bucket: "nalanda-hub",
      key: `thumbnails/${existingContent.File?.name.slice(
        0,
        existingContent.File.name.length - 4
      )}.1.png`,
    });

    await prisma.file.delete({
      where: {
        contentId,
      },
    });

    await prisma.content.delete({
      where: {
        id: contentId,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Content deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, message: "Failed to delete content" });
  }
}

export async function getAllMyContents(
  req: AuthenticatedRequest,
  res: Response
) {
  const pageNumber =
    typeof req.query.page === "string" ? Number(req.query.page) : 1;
  const limit =
    typeof req.query.perPage === "string" ? Number(req.query.perPage) : 6;

  try {
    const totalItems = await prisma.content.count({
      where: { uploadedBy: req.user?.id },
    });

    const contents = await prisma.content.findMany({
      where: {
        uploadedBy: req.user?.id,
      },
      take: limit,
      skip: (pageNumber - 1) * limit,
      include: {
        Semester: {
          select: {
            name: true,
          },
        },
        Subject: {
          select: {
            name: true,
          },
        },
        Unit: {
          select: {
            name: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = pageNumber < totalPages;

    res.send({
      success: true,
      data: contents,
      meta: {
        currentPage: pageNumber,
        nextPage: hasMore ? pageNumber + 1 : null,
        prevPage: pageNumber > 1 ? pageNumber - 1 : null,
        totalItems,
        totalPages,
        hasMore,
        pageSize: limit,
      },
    });
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
        branchId: req.user?.branchId!,
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
        Semester: true,
        Branch: true,
        Unit: true,
        Subject: true,
      },
    });

    const moderators = await prisma.user.findMany({
      where: {
        role: "MOD",
        branchId: req.user?.branchId!,
      },
    });

    const randomIndex = Math.floor(Math.random() * moderators.length);
    const moderatorId = moderators[randomIndex].id;

    const request = await prisma.request.create({
      data: {
        branchId: content.branchId,
        semesterId: content.semesterId,
        subjectId: content.subjectId,
        unitId: content.unitId,
        contentId: content.id,
        requestType: "UploadContent",
        requesterId: req.user?.id!,
        moderatorId,
        title: `${updatedContent.Branch.name} | ${updatedContent.Semester.name} | ${updatedContent.Subject.name} | ${updatedContent.Unit.name}`,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: moderatorId,
        type: "NewContentUpdate",
        title: `${req.user?.fullName!} uploaded content for: ${request.title}`,
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

// export async function updateContent(req: AuthenticatedRequest, res: Response) {
//   try {
//     const { success, error, data } = updateContentSchema.safeParse(req.body);

//     if (!success) {
//       res.status(400).send({
//         success,
//         error: error.issues.map((issue) => issue.message).join(", "),
//       });
//       return;
//     }

//     const unitName = await prisma.unit.findFirst({
//       where: {
//         id: data.unitId,
//       },
//       select: {
//         name: true,
//       },
//     });

//     const content = await prisma.content.create({
//       data: {
//         title: unitName?.name!,
//         description: "",
//         imageUrl: thumbnailUrl,
//         uploadedBy: req.user?.id!,
//         status: false,
//         branchId: data.branchId,
//         semesterId: data.semesterId,
//         subjectId: data.subjectId,
//         unitId: data.unitId,
//       },
//     });

//     const newFile = await prisma.file.create({
//       data: {
//         name: file.key.split("/")[1],
//         url: file.location,
//         size: file.size,
//         type: FileType.pdf,
//         content: {
//           connect: {
//             id: content.id,
//           },
//         },
//       },
//     });

//     const updatedContent = await prisma.content.update({
//       where: {
//         id: content.id,
//       },
//       data: {
//         fileId: newFile.id,
//       },
//       include: {
//         File: true,
//       },
//     });

//     res.status(200).send({
//       success: true,
//       content: updatedContent,
//       message: "Created new content successfully",
//     });
//   } catch (e) {
//     console.error(e);
//     res
//       .status(500)
//       .send({ success: false, error: "Failed to create new content" });
//   }
// }
