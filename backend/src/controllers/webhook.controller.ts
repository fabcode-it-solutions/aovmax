import type { Request, Response } from "express";
import { handleWebhook, verifyWebhookSignature, isServiceError } from "../services/webhook.service";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhook/plaid
// ─────────────────────────────────────────────────────────────────────────────
export async function handlePlaidWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Verify webhook signature (if configured)
    const signature = req.headers["plaid-verification"] as string;
    const webhookSecret = process.env.PLAID_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );

      if (!isValid) {
        console.error("[Webhook] Invalid signature");
        res.status(401).json({ error: "Invalid webhook signature" });
        return;
      }
    }

    // Process webhook
    const result = await handleWebhook(req.body);

    if (isServiceError(result)) {
      res.status(result.statusCode).json({ error: result.message });
      return;
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error("[Webhook] Controller error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
