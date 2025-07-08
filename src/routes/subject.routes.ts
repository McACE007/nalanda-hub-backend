import { Router } from "express";
import { fetchAllSubjects } from "../controllers/subject.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, fetchAllSubjects);

export default router;
