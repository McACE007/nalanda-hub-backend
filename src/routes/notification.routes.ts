import { Router } from "express";
import { getAllNotifications } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getAllNotifications);

export default router;
