import type { Response } from "express";
import { createPayment, getPaymentStatus, isServiceError } from "../services/payment.service";
import { createTestPayment } from "../services/test-payment.service";
import { validateCreatePaymentBody } from "../validators/payment.validator";
import type { AuthenticatedRequest, CreatePaymentBody } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/create
// ─────────────────────────────────────────────────────────────────────────────
export async function handleCreatePayment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const validation = validateCreatePaymentBody(req.body as Partial<CreatePaymentBody>);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const token = req.headers.authorization?.split(" ")[1];
  const result = await createPayment(req.user.id, req.body as CreatePaymentBody, token);

  if (isServiceError(result)) {
    res.status(result.statusCode).json({
      error: result.message,
      ...(result.details && { details: result.details }),
    });
    return;
  }

  res.status(201).json({ success: true, ...result });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/test - FOR TESTING ONLY (bypasses Plaid)
// ─────────────────────────────────────────────────────────────────────────────
export async function handleCreateTestPayment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const validation = validateCreatePaymentBody(req.body as Partial<CreatePaymentBody>);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await createTestPayment(req.user.id, req.body as CreatePaymentBody);

  if (isServiceError(result)) {
    res.status(result.statusCode).json({
      error: result.message,
      ...(result.details && { details: result.details }),
    });
    return;
  }

  res.status(201).json({ success: true, ...result });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/:id
// ─────────────────────────────────────────────────────────────────────────────
export async function handleGetPaymentStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ error: "Payment ID is required" });
    return;
  }

  const result = await getPaymentStatus(req.user.id, id);

  if (isServiceError(result)) {
    res.status(result.statusCode).json({ error: result.message });
    return;
  }

  res.status(200).json(result);
}
