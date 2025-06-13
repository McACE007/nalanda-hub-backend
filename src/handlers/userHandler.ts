import { Request, Response } from "express";
import { NewContentRequest, UploadContentRequest } from "../types";
import { prisma } from "../db";

export async function handleUploadContentRequest(req: Request, res: Response) {
  try {
    console.log(req.body);
    const parsedRequest = UploadContentRequest.safeParse(req.body);

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

    res.send({ content });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}

export async function handleNewContentRequest(req: Request, res: Response) {
  try {
    const parsedRequest = NewContentRequest.safeParse(req.body);

    if (!parsedRequest.success) {
      res.send({ message: "Invalid format" });
      console.log(parsedRequest.error);
      return;
    }

    const newContentRequest = await prisma.newContentRequest.create({
      data: {
        title: parsedRequest.data.title,
        description: parsedRequest.data.description,
        // @ts-ignore
        requesterId: req.userId,
        branchId: parsedRequest.data.branchId,
        semesterId: parsedRequest.data.semesterId,
        subjectId: parsedRequest.data.subjectId,
        unitId: parsedRequest.data.unitId,
        requestType: parsedRequest.data.requestType,
      },
    });

    res.send({ newContentRequest });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}
