import { NextFunction, Request, Response } from "express";
import { USER_ROLE } from "../generated/prisma";

export async function modMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // @ts-ignore
  if (req.userRole === USER_ROLE.MOD) {
    next();
  } else {
    res.send("Not Authorized, you have to be a mod");
  }
}
