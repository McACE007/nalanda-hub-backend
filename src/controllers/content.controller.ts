import { Request, Response } from "express";
import { prisma } from "../db";
import { Prisma } from "../generated/prisma";

export async function getContentById(req: Request, res: Response) {
  try {
    const contentId = Number(req.params.contentId);

    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        status: true,
      },
      include: {
        File: true,
      },
    });

    if (!content) {
      res.status(404).json({
        success: false,
        error: "Content not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      content,
      message: "Fetched content successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Failed to fetch content" });
  }
}

export async function getALlContents(req: Request, res: Response) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "";
    const semesterId =
      typeof req.query.semester === "string" && req.query.semester !== "all"
        ? Number(req.query.semester)
        : undefined;
    const subjectId =
      typeof req.query.subject === "string" && req.query.subject !== "all"
        ? Number(req.query.subject)
        : undefined;
    const unitId =
      typeof req.query.unit === "string" && req.query.unit !== "all"
        ? Number(req.query.unit)
        : undefined;
    const pageNumber =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.perPage === "string" ? Number(req.query.perPage) : 30;

    const orderByMap: {
      [key: string]: Prisma.ContentOrderByWithRelationInput;
    } = {
      newest: { uploadedDate: "desc" },
      oldest: { uploadedDate: "asc" },
      "a-z": { title: "asc" },
      "z-a": { title: "desc" },
    };

    const where: Prisma.ContentWhereInput = {
      status: true,
      semesterId,
      subjectId,
      unitId,
      title: {
        contains: search,
        mode: "insensitive",
      },
    };

    const [contents, totalItems] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: orderByMap[sortBy],
        take: limit,
        skip: (pageNumber - 1) * limit,
        include: {
          uploader: {
            select: {
              fullName: true,
            },
          },
        },
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = pageNumber < totalPages;

    res.status(200).json({
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
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ success: false, error: "Failed to fetch all contents" });
  }
}
