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
    const pageNumber =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.perPage === "string" ? Number(req.query.perPage) : 6;

    const requests = await prisma.request.findMany({
      where: {
        requesterId: req.user?.id,
      },
    });

    const totalItems = await prisma.request.count({
      where: {
        requesterId: req.user?.id!,
      },
      take: limit,
      skip: (pageNumber - 1) * limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = pageNumber < totalPages;

    res.send({
      success: false,
      data: requests,
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
      .send({ success: false, error: "Failed to fetch all requests" });
  }
}

export async function createNewRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { success, error, data } = createNewRequestSchema.safeParse(req.body);

    console.table(req.body);

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

    const request = await prisma.request.create({
      data: {
        title: `${semester.name} | ${subject.name} | ${unit.name}`,
        requestType: data.requestType as RequestType,
        branchId: data.branchId,
        semesterId: data.semesterId,
        subjectId: data.subjectId,
        unitId: data.unitId,
        requesterId: req.user?.id!,
        moderatorId: moderatorId,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: moderatorId,
        title: `${user.fullName} requested: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
        type: "RequestForContent",
      },
    });

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
