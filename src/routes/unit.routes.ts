import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { fetchAllUnits } from "../controllers/unit.controller";

const router = Router();

router.get("/", authMiddleware, fetchAllUnits);

export default router;
