import { Request, Response } from "express";
import { CreateRequest, UploadContent } from "../types";
import { prisma } from "../db";
import { RequestType } from "../generated/prisma";

export async function handleGetMyContentById(req: Request, res: Response) {
  try {
    const contentId = Number(req.params.contentId);

    if (!contentId) {
      res.send({ message: "No contentId given" });
      return;
    }

    const content = await prisma.content.findUnique({
      where: {
        // @ts-ignore
        uploadedBy: req.userId,
        id: contentId,
      },
    });

    if (!content) {
      res.send({ message: "Content not found" });
      return;
    }
    res.send({ content });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleGetAllMyContent(req: Request, res: Response) {
  try {
    const contents = await prisma.content.findMany({
      where: {
        // @ts-ignore
        uploadedBy: req.userId,
      },
    });

    res.send({ contents });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleGetMyRequestById(req: Request, res: Response) {
  try {
    const requestId = Number(req.params.requestId);

    if (!requestId) {
      res.send({ message: "No requestId given" });
      return;
    }

    const request = await prisma.request.findUnique({
      where: {
        // @ts-ignore
        requesterId: req.userId,
        id: requestId,
      },
    });

    if (!request) {
      res.send({ message: "Request not found" });
      return;
    }
    res.send({ request });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleGetAllMyRequest(req: Request, res: Response) {
  try {
    const requests = await prisma.request.findMany({
      where: {
        // @ts-ignore
        requesterId: req.userId,
      },
    });

    res.send({ requests });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleUploadContent(req: Request, res: Response) {
  try {
    const parsedRequest = UploadContent.safeParse(req.body);

    if (!parsedRequest.success) {
      res.send({ message: "Invalid format" });
      console.log(parsedRequest.error);
      return;
    }

    const content = await prisma.content.create({
      data: {
        title: parsedRequest.data.title,
        description: parsedRequest.data.description,
        imageUrl: "",
        // @ts-ignore
        uploadedBy: req.userId,
        status: false,
        branchId: parsedRequest.data.branchId,
        semesterId: parsedRequest.data.semesterId,
        subjectId: parsedRequest.data.subjectId,
        unitId: parsedRequest.data.unitId,
      },
    });

    res.send({ content, message: "Content uploaded successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleCreateRequest(req: Request, res: Response) {
  try {
    const parsedRequest = CreateRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.send({ message: "Invalid format" });
      console.log(parsedRequest.error);
      return;
    }

    const moderators = await prisma.user.findMany({
      where: {
        role: "MOD",
        branchId: parsedRequest.data.branchId,
      },
    });

    const randomIndex = Math.floor(Math.random() * moderators.length);
    const moderatorId = moderators[randomIndex].id;

    switch (parsedRequest.data.requestType) {
      case RequestType.NewContent: {
        const request = await prisma.request.create({
          data: {
            title: parsedRequest.data.title,
            description: parsedRequest.data.description,
            requestType: parsedRequest.data.requestType,
            branchId: parsedRequest.data.branchId,
            semesterId: parsedRequest.data.semesterId,
            subjectId: parsedRequest.data.subjectId,
            unitId: parsedRequest.data.unitId,
            // @ts-ignore
            requesterId: req.userId,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          // @ts-ignore
          prisma.user.findUnique({ where: { id: req.userId } }),
          prisma.semester.findUnique({
            where: { id: parsedRequest.data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: parsedRequest.data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: parsedRequest.data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res
            .status(400)
            .json({ message: "Invalid user or academic references." });
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
            title: parsedRequest.data.title,
            description: parsedRequest.data.description,
            requestType: parsedRequest.data.requestType,
            branchId: parsedRequest.data.branchId,
            semesterId: parsedRequest.data.semesterId,
            subjectId: parsedRequest.data.subjectId,
            unitId: parsedRequest.data.unitId,
            // @ts-ignore
            requesterId: req.userId,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          // @ts-ignore
          prisma.user.findUnique({ where: { id: req.userId } }),
          prisma.semester.findUnique({
            where: { id: parsedRequest.data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: parsedRequest.data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: parsedRequest.data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res
            .status(400)
            .json({ message: "Invalid user or academic references." });
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
            title: parsedRequest.data.title,
            description: parsedRequest.data.description,
            requestType: parsedRequest.data.requestType,
            branchId: parsedRequest.data.branchId,
            semesterId: parsedRequest.data.semesterId,
            subjectId: parsedRequest.data.subjectId,
            unitId: parsedRequest.data.unitId,
            contentId: parsedRequest.data.contentId,
            // @ts-ignore
            requesterId: req.userId,
            moderatorId: moderatorId,
          },
        });

        const [user, semester, subject, unit] = await Promise.all([
          // @ts-ignore
          prisma.user.findUnique({ where: { id: req.userId } }),
          prisma.semester.findUnique({
            where: { id: parsedRequest.data.semesterId },
          }),
          prisma.subject.findUnique({
            where: { id: parsedRequest.data.subjectId },
          }),
          prisma.unit.findUnique({ where: { id: parsedRequest.data.unitId } }),
        ]);

        if (!user || !semester || !subject || !unit) {
          res
            .status(400)
            .json({ message: "Invalid user or academic references." });
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

    res.send({ message: "Request created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}
