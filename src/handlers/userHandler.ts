import { Request, Response } from "express";
import { CreateContentRequest } from "../types";
import { prisma } from "../db";

export async function handleUploadFile(req: Request, res: Response) {
  try {
    const parsedRequest = CreateContentRequest.safeParse(req);

    if (!parsedRequest.success) {
      res.send({ message: "Invalid format" });
      return;
    }

    const content = await prisma.content.create({
      data: {
        title: parsedRequest.data.title,
        description: parsedRequest.data.description,
        imageUrl: "",
        uploadedBy: 0,
        status: false,
        branchId: parsedRequest.data.branchId,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Something went wrong!" });
  }
}
