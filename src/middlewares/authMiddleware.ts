import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.send({ message: "Unauthorized User" });
      return;
    }

    const token = authHeader.substring(7);

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // @ts-ignore
    req.userId = decodedToken.userId;
    // @ts-ignore
    req.userRole = decodedToken.userRole;

    next();
  } catch (e) {
    res.send({ message: "Unauthorized User" });
  }
}
