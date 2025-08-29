import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { prisma } from "../db";
import { Response } from "express";

export async function getAllNotifications(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const pageNumber =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.perPage === "string" ? Number(req.query.perPage) : 6;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user?.id,
      },
      take: limit,
      skip: (pageNumber - 1) * limit,
    });

    const totalItems = await prisma.notification.count({
      where: {
        userId: req.user?.id,
      },
    });

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = pageNumber < totalPages;

    res.send({
      success: false,
      data: notifications,
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
      .send({ success: false, error: "Failed to fetch notification" });
  }
}
