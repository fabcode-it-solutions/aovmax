import { Router } from "express";
import { handlePlaidWebhook } from "../controllers/webhook.controller";

const router = Router();

// Webhook endpoint - NO AUTH (Plaid calls this)
router.post("/plaid", handlePlaidWebhook);

export default router;
