import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";

const userRouter = Router();

userRouter.get("/", authMiddleware, modMiddleware, (req, res) => {
  // @ts-ignore
  res.send({ data: "users list", userId: req.userId });
});
userRouter.post("/upload-file", () => {});
userRouter.post("/upload-content-request", () => {});
userRouter.post("/new-content-request", () => {});

// POST  -> create
// PATCH -> Upload
// DELETE -> delete
// GET -> fetch

export default userRouter;
