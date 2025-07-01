import { NextFunction, Request, Response } from "express";
import { USER_ROLE } from "../generated/prisma";
import { AuthenticatedRequest } from "./auth.middleware";

export async function modMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role === USER_ROLE.MOD) {
    next();
  } else {
    res.status(403).send({ success: false, error: "Not authorized" });
  }
}
