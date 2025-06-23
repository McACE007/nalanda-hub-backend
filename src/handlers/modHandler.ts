import { Request, response, Response } from "express";
import { prisma } from "../db";

export async function getAllAssignedRequests(req: Request, res: Response) {
  try {
    // @ts-ignore
    const moderatorId = req.userId;

    const assignedRequests = await prisma.request.findMany({
      where: {
        moderatorId,
      },
    });

    res.send({ assignedRequests });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to get all assigned requests" });
  }
}

export async function getAssignedRequest(req: Request, res: Response) {
  try {
    // @ts-ignore
    const moderatorId = req.userId;
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

export async function approveRequest(req: Request, res: Response) {
  try {
    // @ts-ignore
    const moderatorId = req.userId;
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

export async function rejectRequest(req: Request, res: Response) {
  try {
    // @ts-ignore
    const moderatorId = req.userId;
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
            status: "Rejected",
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
            status: "Rejected",
            Content: {
              update: {
                status: false,
              },
            },
          },
        });
        break;
      }
    }

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
