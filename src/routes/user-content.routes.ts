import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createNewContent,
  getAllMyContents,
  getMyContentById,
} from "../controllers/user-content.controller";

const router = Router();

router.post("/contents", authMiddleware, createNewContent);
router.get("/contents", authMiddleware, getAllMyContents);
router.get("/contents/:contentId", authMiddleware, getMyContentById);

export default router;
