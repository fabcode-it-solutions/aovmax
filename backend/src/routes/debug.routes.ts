import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { handleDebugPlaidAccounts, handleDebugInvoice } from "../controllers/debug.controller";
import type { AuthenticatedRequest } from "../types";

const router = Router();

router.get("/plaid-accounts", requireAuth as any, (req, res) =>
  handleDebugPlaidAccounts(req as AuthenticatedRequest, res)
);

router.get("/invoice/:invoiceId", requireAuth as any, (req, res) =>
  handleDebugInvoice(req as AuthenticatedRequest, res)
);

export default router;
