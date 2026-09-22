import type { Response } from "express";
import { createLinkToken, exchangeToken } from "../services/plaid.service";
import { validateExchangeTokenBody } from "../validators/plaid.validator";
import { isServiceError } from "../types";
import type { AuthenticatedRequest, ExchangeTokenBody } from "../types";

export async function handleCreateLinkToken(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const result = await createLinkToken(req.user.id);

  if (isServiceError(result)) {
    res.status(result.statusCode).json({ error: result.message, details: result.details });
    return;
  }

  res.status(200).json(result);
}

export async function handleExchangeToken(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const validation = validateExchangeTokenBody(req.body as Partial<ExchangeTokenBody>);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  // Extract JWT token from Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  const result = await exchangeToken(req.user.id, req.body as ExchangeTokenBody, token);

  if (isServiceError(result)) {
    res.status(result.statusCode).json({ error: result.message, details: result.details });
    return;
  }

  res.status(200).json({ success: true, ...result });
}