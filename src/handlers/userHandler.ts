import { Request, Response } from "express";
import { CreateRequest } from "../types";
import { prisma } from "../db";
import { RequestType } from "../generated/prisma";

export async function handleCreateRequest(req: Request, res: Response) {
  try {
    const parsedRequest = CreateRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.send({ message: "Invalid format" });
      console.log(parsedRequest.error);
      return;
    }

    let request;

    switch (parsedRequest.data.requestType) {
      case RequestType.NewContent: {
        request = await prisma.request.create({
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
      case RequestType.UpdateContent: {
        request = await prisma.request.create({
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
        const content = await prisma.content.create({});

        request = await prisma.request.create({
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
      default:
        break;
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

    res.send({ content });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}
