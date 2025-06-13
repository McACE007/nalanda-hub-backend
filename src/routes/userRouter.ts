import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import {
  handleNewContentRequest,
  handleUploadContentRequest,
} from "../handlers/userHandler";

const userRouter = Router();

userRouter.post(
  "/upload-content-request",
  authMiddleware,
  handleUploadContentRequest
);
userRouter.post(
  "/new-content-request",
  authMiddleware,
  handleNewContentRequest
);

export default userRouter;
