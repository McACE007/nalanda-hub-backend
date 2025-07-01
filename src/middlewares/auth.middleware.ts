import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants/global.constants";
import { User } from "../types/user.types";

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .send({ success: false, error: "Invalid or missing access token" });
      return;
    }

    const token = authHeader.substring(7);

    const user = jwt.verify(token, JWT_SECRET) as User;

    req.user = user;

    next();
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ success: false, error: "Failed to authenticate user" });
  }
}
