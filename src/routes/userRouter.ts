import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import { handleCreateRequest } from "../handlers/userHandler";

const userRouter = Router();

userRouter.post("/create-request", authMiddleware, handleCreateRequest);

export default userRouter;
