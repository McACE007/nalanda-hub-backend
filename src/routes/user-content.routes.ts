import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createNewContent,
  deleteContent,
  getAllMyContents,
  getMyContentById,
} from "../controllers/user-content.controller";
import { upload } from "../config/multerConfig";

const router = Router();

router.post("/", authMiddleware, upload.single("files"), createNewContent);
router.get("/", authMiddleware, getAllMyContents);
router.get("/:contentId", authMiddleware, getMyContentById);
router.delete("/:contentId", authMiddleware, deleteContent);

export default router;
