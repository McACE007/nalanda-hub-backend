import { Router } from "express";
import {
  getALlContents,
  getContentById,
} from "../controllers/content.controller";

const router = Router();

router.get("/", getALlContents);
router.get("/:contentId", getContentById);

export default router;
