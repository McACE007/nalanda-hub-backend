import { Request, Response } from "express";
import { CreateRequest } from "../types";
import { prisma } from "../db";
import { RequestType } from "../generated/prisma";
import userRouter from "../routes/userRouter";

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
            title: `${user.fullName} uploaded: Content for ${semester.name} | ${subject.name} | ${unit.name}`,
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
            moderatorId: 1,
          },
        });
        break;
      }
      case RequestType.UploadContent: {
        // const content = await prisma.content.create({});

        // request = await prisma.request.create({
        //   data: {
        //     title: parsedRequest.data.title,
        //     description: parsedRequest.data.description,
        //     requestType: parsedRequest.data.requestType,
        //     branchId: parsedRequest.data.branchId,
        //     semesterId: parsedRequest.data.semesterId,
        //     subjectId: parsedRequest.data.subjectId,
        //     unitId: parsedRequest.data.unitId,
        //     // @ts-ignore
        //     requesterId: req.userId,
        //     moderatorId: 1,
        //   },
        // });
        break;
      }
      default:
        break;
    }

    // const content = await prisma.content.create({
    //   data: {
    //     title: parsedRequest.data.title,
    //     description: parsedRequest.data.description,
    //     imageUrl: "",
    //     // @ts-ignore
    //     uploadedBy: req.userId,
    //     status: false,
    //     branchId: parsedRequest.data.branchId,
    //     semesterId: parsedRequest.data.semesterId,
    //     subjectId: parsedRequest.data.subjectId,
    //     unitId: parsedRequest.data.unitId,
    //   },
    // });

    res.send({ message: "Request created successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}
