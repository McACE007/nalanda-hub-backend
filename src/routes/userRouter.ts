import { Router } from "express";

const userRouter = Router();

userRouter.post("/upload-content-request");
userRouter.post("/new-content-request");

export default userRouter;
