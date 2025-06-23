import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { modMiddleware } from "../middlewares/modMiddleware";
import {
  approveRequest,
  getAllAssignedRequests,
  getAssignedRequest,
  rejectRequest,
} from "../handlers/modHandler";

const router = Router();

router.get(
  "/assigned-requests",
  authMiddleware,
  modMiddleware,
  getAllAssignedRequests
);

router.get(
  "/assigned-requests/:requestId",
  authMiddleware,
  modMiddleware,
  getAssignedRequest
);

router.post(
  "/assigned-requests/:requestId/approve",
  authMiddleware,
  modMiddleware,
  approveRequest
);

router.post(
  "/assigned-requests/:requestId/reject",
  authMiddleware,
  modMiddleware,
  rejectRequest
);

export default router;
