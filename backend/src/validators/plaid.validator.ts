import type { ExchangeTokenBody } from "../types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Validate POST /api/plaid/exchange-token body ─────────────────────────────
export function validateExchangeTokenBody(body: Partial<ExchangeTokenBody>): ValidationResult {
  const { public_token, account_id, mask } = body;

  if (!public_token || typeof public_token !== "string" || public_token.trim() === "") {
    return { valid: false, error: "public_token is required and must be a string" };
  }

  if (!account_id || typeof account_id !== "string" || account_id.trim() === "") {
    return { valid: false, error: "account_id is required and must be a string" };
  }

  if (!mask || typeof mask !== "string" || mask.trim() === "") {
    return { valid: false, error: "mask (last 4 digits) is required" };
  }

  if (mask.length > 4) {
    return { valid: false, error: "mask must be the last 4 digits only" };
  }

  return { valid: true };
}