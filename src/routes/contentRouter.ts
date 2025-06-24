import { Router } from "express";
import { getALlContents, getContent } from "../handlers/contentHandler";

const router = Router();

router.get("/", getALlContents);
router.get("/:contentId", getContent);

export default router;
