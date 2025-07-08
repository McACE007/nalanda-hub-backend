import { Router } from "express";
import { fetchAllSemester } from "../controllers/semester.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, fetchAllSemester);

export default router;
