import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createNewRequest,
  getAllMyRequests,
  getMyRequestById,
} from "../controllers/user-request.controller";
import { upload } from "../config/multerConfig";

const router = Router();

router.post("/", authMiddleware, upload.none(), createNewRequest);
router.get("/", authMiddleware, getAllMyRequests);
router.get("/:requestId", authMiddleware, getMyRequestById);

export default router;
