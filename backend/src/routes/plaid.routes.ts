import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { handleCreateLinkToken, handleExchangeToken } from "../controllers/plaid.controller";
import type { AuthenticatedRequest } from "../types";

const router = Router();

// All Plaid routes require a valid Supabase JWT
router.post("/create-link-token", requireAuth as any, (req, res) =>
  handleCreateLinkToken(req as AuthenticatedRequest, res)
);

router.post("/exchange-token", requireAuth as any, (req, res) =>
  handleExchangeToken(req as AuthenticatedRequest, res)
);

export default router;