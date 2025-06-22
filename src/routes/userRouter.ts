import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  handleCreateRequest,
  handleGetAllMyContent,
  handleGetAllMyRequest,
  handleGetMyContentById,
  handleGetMyRequestById,
  handleUploadContent,
} from "../handlers/userHandler";

const userRouter = Router();

userRouter.post("/contents", authMiddleware, handleUploadContent);
userRouter.get("/contents", authMiddleware, handleGetAllMyContent);
userRouter.get("/contents/:contentId", authMiddleware, handleGetMyContentById);

userRouter.post("/requests", authMiddleware, handleCreateRequest);
userRouter.get("/requests", authMiddleware, handleGetAllMyRequest);
userRouter.get("/requests/:requestId", authMiddleware, handleGetMyRequestById);

export default userRouter;
