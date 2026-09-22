import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

// ─── Express request with verified Supabase user attached ────────────────────
export interface AuthenticatedRequest extends Request {
  user: User;
}

// ─── Plaid route bodies ───────────────────────────────────────────────────────
export interface CreateLinkTokenBody {
  // nothing required from client — user comes from the JWT
}

export interface ExchangeTokenBody {
  public_token: string;
  account_id: string;
  institution_name: string | null;
  account_name: string;
  account_subtype: string | null;
  mask: string;
}

export interface CreatePaymentBody {
  payment_method_id: string;
  amount: number;
  description?: string;
}

// ─── Service layer return types ───────────────────────────────────────────────
export interface CreateLinkTokenResult {
  link_token: string;
}

export interface ExchangeTokenResult {
  payment_method: {
    id: string;
    bank_name: string;
    last_four: string;
    account_type: string;
    is_default: boolean;
  };
}

export interface CreatePaymentResult {
  payment: {
    id: string;
    amount: number;
    status: string;
    created_at: string;
  };
}

export interface PaymentStatusResult {
  payment: {
    id: string;
    amount: number;
    status: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface ServiceError {
  message: string;
  details?: string;
  statusCode: number;
}

// ─── Supabase table shapes (matching real schema) ─────────────────────────────
export interface PlaidAccount {
  id: string;
  user_id: string;
  access_token: string;
  item_id: string;
  account_id: string;
  institution_name: string | null;
  account_name: string | null;
  account_subtype: string | null;
  mask: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: string;
  provider_id: string | null;
  bank_name: string | null;
  card_brand: string | null;
  last_four: string;
  account_type: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  processing_fee: number;
  total_charged: number;
  status: string; // 'pending' | 'processing' | 'paid' | 'failed'
  payment_method_id: string | null;
  period_start: string;
  period_end: string;
  profit_generated: number;
  premiums_collected: number;
  revenue_share_percent: number;
  paid_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_name: string | null;
  contact_name: string | null;
  revenue_share_percent: number;
  created_at: string;
  updated_at: string;
}

// ─── Billing ──────────────────────────────────────────────────────────────────
export interface ChargeInvoiceBody {
  invoice_id: string;
}

// ─── Service layer ────────────────────────────────────────────────────────────
export interface ServiceError {
  statusCode: number;
  message: string;
  details?: string;
}

export function isServiceError(result: unknown): result is ServiceError {
  return (
    typeof result === "object" &&
    result !== null &&
    "statusCode" in result &&
    "message" in result
  );
}
