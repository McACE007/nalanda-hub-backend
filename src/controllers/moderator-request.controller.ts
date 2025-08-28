import { Request, response, Response } from "express";
import { prisma } from "../db";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function getAllAssignedRequests(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const pageNumber =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.perPage === "string" ? Number(req.query.perPage) : 6;

    const moderatorId = req.user?.id;

    const totalItems = await prisma.request.count({
      where: { moderatorId },
    });

    const assignedRequests = await prisma.request.findMany({
      where: {
        moderatorId,
      },
      include: {
        User: true,
        Branch: true,
        Semester: true,
        Subject: true,
        Unit: true,
        Content: {
          include: {
            File: true,
          },
        },
      },
      take: limit,
      skip: (pageNumber - 1) * limit,
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = pageNumber < totalPages;

    res.status(200).send({
      success: true,
      data: assignedRequests,
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
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to fetch all assigned requests" });
  }
}

export async function getAssignedRequest(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const moderatorId = req.user?.id;
    const requestId = Number(req.params.requestId);

    if (!requestId) {
      res.send({ success: false, error: "Request Id not given" });
    }

    const assignedRequest = await prisma.request.findFirst({
      where: {
        moderatorId,
        id: requestId,
      },
    });

    if (!assignedRequest) {
      res
        .status(404)
        .json({ success: false, error: "Assigned request not found" });
      return;
    }

    res.send({ success: true, assignedRequest });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to get assigned request" });
  }
}

export async function approveRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const moderatorId = req.user?.id;
    const requestId = Number(req.params.requestId);

    if (!requestId) {
      res.send({ success: false, error: "Request Id not given" });
    }

    const assignedRequest = await prisma.request.findFirst({
      where: {
        moderatorId,
        id: requestId,
      },
    });

    if (!assignedRequest) {
      res
        .status(404)
        .json({ success: false, error: "Assigned request not found" });
      return;
    }

    if (assignedRequest.status !== "Pending") {
      res.status(400).json({
        success: false,
        error: "Assigned request is already been processed",
      });
      return;
    }

    let updatedAssignedRequest: unknown;

    switch (assignedRequest.requestType) {
      case "NewContent":
      case "UpdateContent": {
        updatedAssignedRequest = await prisma.request.update({
          where: {
            id: requestId,
          },
          data: {
            status: "Approved",
          },
        });
        break;
      }

      case "UploadContent": {
        updatedAssignedRequest = await prisma.request.update({
          where: {
            id: requestId,
          },
          data: {
            status: "Approved",
            Content: {
              update: {
                status: true,
              },
            },
          },
        });
        break;
      }
    }

    const [user, semester, subject, unit] = await Promise.all([
      prisma.user.findUnique({ where: { id: assignedRequest.requesterId } }),
      prisma.semester.findUnique({
        where: { id: assignedRequest.semesterId },
      }),
      prisma.subject.findUnique({
        where: { id: assignedRequest.subjectId },
      }),
      prisma.unit.findUnique({ where: { id: assignedRequest.unitId } }),
    ]);

    if (!user || !semester || !subject || !unit) {
      res.status(404).json({
        success: false,
        error: "Invalid user or academic references.",
      });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: `${user.fullName} your request has been approved: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
        type: "Approved",
      },
    });

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      updatedAssignedRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to approve request" });
  }
}

export async function rejectRequest(req: AuthenticatedRequest, res: Response) {
  try {
    const moderatorId = req.user?.id;
    const requestId = Number(req.params.requestId);
    const rejectionReason = req.body.rejectionReason;

    if (!requestId) {
      res.send({ success: false, error: "Request Id not given" });
    }

    const assignedRequest = await prisma.request.findFirst({
      where: {
        moderatorId,
        id: requestId,
      },
    });

    if (!assignedRequest) {
      res
        .status(404)
        .json({ success: false, error: "Assigned request not found" });
      return;
    }

    if (assignedRequest.status !== "Pending") {
      res.status(400).json({
        success: false,
        error: "Assigned request is already been processed",
      });
      return;
    }

    const updatedAssignedRequest = await prisma.request.update({
      where: {
        id: requestId,
      },
      data: {
        status: "Rejected",
        rejectionReason: rejectionReason,
      },
    });

    const [user, semester, subject, unit] = await Promise.all([
      prisma.user.findUnique({ where: { id: assignedRequest.requesterId } }),
      prisma.semester.findUnique({
        where: { id: assignedRequest.semesterId },
      }),
      prisma.subject.findUnique({
        where: { id: assignedRequest.subjectId },
      }),
      prisma.unit.findUnique({ where: { id: assignedRequest.unitId } }),
    ]);

    if (!user || !semester || !subject || !unit) {
      res.status(404).json({
        success: false,
        error: "Invalid user or academic references.",
      });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title: `${user.fullName} your request has been rejected: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
        type: "Rejected",
      },
    });

    res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      updatedAssignedRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Failed to reject request" });
  }
}
