import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { handleCreatePayment, handleCreateTestPayment, handleGetPaymentStatus } from "../controllers/payment.controller";
import type { AuthenticatedRequest } from "../types";

const router = Router();

router.post("/create", requireAuth as any, (req, res) =>
  handleCreatePayment(req as AuthenticatedRequest, res)
);

// TEST ENDPOINT - bypasses Plaid API
router.post("/test", requireAuth as any, (req, res) =>
  handleCreateTestPayment(req as AuthenticatedRequest, res)
);

router.get("/:id", requireAuth as any, (req, res) =>
  handleGetPaymentStatus(req as AuthenticatedRequest, res)
);

export default router;
