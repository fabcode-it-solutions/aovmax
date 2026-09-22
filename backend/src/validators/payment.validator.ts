import type { CreatePaymentBody } from "../types";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCreatePaymentBody(body: Partial<CreatePaymentBody>): ValidationResult {
  const { payment_method_id, amount } = body;

  if (!payment_method_id || typeof payment_method_id !== "string") {
    return { valid: false, error: "payment_method_id is required" };
  }

  if (typeof amount !== "number" || amount <= 0) {
    return { valid: false, error: "amount must be a positive number" };
  }

  if (amount > 25000) {
    return { valid: false, error: "amount cannot exceed $25,000 per transaction" };
  }

  return { valid: true };
}
