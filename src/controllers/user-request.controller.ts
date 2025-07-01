import { Response } from "express";
import { prisma } from "../db";
import { RequestType } from "../generated/prisma";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createNewRequestSchema } from "../schemas/request.schema";

export async function getMyRequestById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const requestId = Number(req.params.requestId);

    const request = await prisma.request.findUnique({
      where: {
        requesterId: req.user?.id,
        id: requestId,
      },
    });

    if (!request) {
      res.status(404).send({ success: false, error: "Request not found" });
      return;
    }
    res.status(200).send({ success: false, request });
  } catch (e) {
    console.error(e);
    res.status(500).send({ success: false, error: "Falied to fetch request" });
  }
}

export async function getAllMyRequests(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const requests = await prisma.request.findMany({
      where: {
        requesterId: req.user?.id,
      },
    });

    res.send({ success: false, requests });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, error: "Failed to fetch all requests" });
  }
}

export async function createNewRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { success, error, data } = createNewRequestSchema.safeParse(req.body);

    if (!success) {
      res.status(400).send({ success, error });
      return;
    }

    const moderators = await prisma.user.findMany({
      where: {
        role: "MOD",
        branchId: data.branchId,
      },
    });

    const randomIndex = Math.floor(Math.random() * moderators.length);
    const moderatorId = moderators[randomIndex].id;

    switch (data.requestType) {
      case RequestType.NewContent: {
        const request = await prisma.request.create({
          data: {
            title: data.title,
            description: data.description,
            requestType: data.requestType,
            branchId: data.branchId,
            semesterId: data.semesterId,
            subjectId: data.subjectId,
            unitId: data.unitId,
            requesterId: req.user?.id!,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          prisma.user.findUnique({ where: { id: req.user?.id } }),
          prisma.semester.findUnique({
            where: { id: data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res.status(400).json({
            success: false,
            error: "Invalid user or academic references.",
          });
          return;
        }

        const notification = await prisma.notification.create({
          data: {
            userId: moderatorId,
            title: `${user.fullName} requested: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
            type: "RequestForContent",
          },
        });

        break;
      }
      case RequestType.UpdateContent: {
        const request = await prisma.request.create({
          data: {
            title: data.title,
            description: data.description,
            requestType: data.requestType,
            branchId: data.branchId,
            semesterId: data.semesterId,
            subjectId: data.subjectId,
            unitId: data.unitId,
            requesterId: req.user?.id!,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          prisma.user.findUnique({ where: { id: req.user?.id } }),
          prisma.semester.findUnique({
            where: { id: data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res.status(400).json({
            success: false,
            error: "Invalid user or academic references.",
          });
          return;
        }

        const notification = await prisma.notification.create({
          data: {
            userId: moderatorId,
            title: `${user.fullName} requested update: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
            type: "RequestForContent",
          },
        });

        break;
      }
      case RequestType.UploadContent: {
        const request = await prisma.request.create({
          data: {
            title: data.title,
            description: data.description,
            requestType: data.requestType,
            branchId: data.branchId,
            semesterId: data.semesterId,
            subjectId: data.subjectId,
            unitId: data.unitId,
            contentId: data.contentId,
            requesterId: req.user?.id!,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          prisma.user.findUnique({ where: { id: req.user?.id } }),
          prisma.semester.findUnique({
            where: { id: data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res.status(400).json({
            success: false,
            error: "Invalid user or academic references.",
          });
          return;
        }

        const notification = await prisma.notification.create({
          data: {
            userId: moderatorId,
            title: `${user.fullName} uploaded: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
            type: "RequestForContent",
          },
        });
        break;
      }
      default:
        throw new Error();
    }

    res
      .status(201)
      .send({ success: true, message: "Created new request successfully" });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, error: "Falied to create new request" });
  }
}
