import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { handleChargeInvoice } from "../controllers/billing.controller";
import type { AuthenticatedRequest } from "../types";

const router = Router();

// Charge a specific invoice
router.post("/charge", requireAuth as any, (req, res) =>
    handleChargeInvoice(req as AuthenticatedRequest, res)
);

export default router;
