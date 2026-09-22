import { PaymentInitiationPaymentCreateRequest, PaymentInitiationPaymentGetRequest, TransferAuthorizationCreateRequest, TransferCreateRequest } from "plaid";
import { getPlaidClient } from "../config/plaid";
import { getSupabaseClient } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import type {
  CreatePaymentBody,
  CreatePaymentResult,
  PaymentStatusResult,
  ServiceError,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// createPayment - Real ACH transfer using Plaid Transfer API
// ─────────────────────────────────────────────────────────────────────────────
export async function createPayment(
  userId: string,
  body: CreatePaymentBody,
  userToken?: string
): Promise<CreatePaymentResult | ServiceError> {
  const { payment_method_id, amount, description } = body;

  try {
    const supabase = userToken
      ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : getSupabaseClient();
    const plaid = getPlaidClient();

    // ── Step 1: Get payment method and Plaid credentials ──────────────────────
    const { data: paymentMethod, error: pmError } = await supabase
      .from("payment_methods")
      .select("id, bank_name, last_four")
      .eq("id", payment_method_id)
      .eq("user_id", userId)
      .single();

    if (pmError || !paymentMethod) {
      return {
        statusCode: 404,
        message: "Payment method not found",
      };
    }

    const { data: plaidItem, error: plaidError } = await supabase
      .from("plaid_accounts")
      .select("access_token, account_id")
      .eq("payment_method_id", payment_method_id)
      .single();

    if (plaidError || !plaidItem) {
      return {
        statusCode: 400,
        message: "Plaid access token not found. Service role key required.",
      };
    }

    console.log(`[PaymentService] Initiating transfer for user: ${userId}`);
    console.log(`[PaymentService] Amount: $${amount}`);

    // ── Step 2: Authorize the transfer ────────────────────────────────────────
    const authRequest: TransferAuthorizationCreateRequest = {
      access_token: plaidItem.access_token,
      account_id: plaidItem.account_id,
      type: "debit",
      network: "ach",
      amount: amount.toString(),
      ach_class: "web",
      user: {
        legal_name: "AOVMAX User",
      },
    };

    const authResponse = await plaid.transferAuthorizationCreate(authRequest);
    const authorizationId = authResponse.data.authorization.id;

    console.log(`[PaymentService] Authorization ID: ${authorizationId}`);

    // ── Step 3: Create the transfer ───────────────────────────────────────────
    const transferRequest: TransferCreateRequest = {
      access_token: plaidItem.access_token,
      account_id: plaidItem.account_id,
      authorization_id: authorizationId,
      description: description || "AOVMAX Payment",
    };

    const transferResponse = await plaid.transferCreate(transferRequest);
    const transfer = transferResponse.data.transfer;

    console.log(`[PaymentService] Transfer ID: ${transfer.id}`);
    console.log(`[PaymentService] Status: ${transfer.status}`);

    // ── Step 4: Save payment record to database ───────────────────────────────
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        payment_method_id,
        plaid_payment_id: transfer.id,
        authorization_id: authorizationId,
        amount,
        status: transfer.status,
        description: description || "AOVMAX Payment",
      })
      .select()
      .single();

    if (insertError || !payment) {
      console.error("[PaymentService] Failed to save payment:", insertError?.message);
      return {
        statusCode: 500,
        message: "Failed to save payment record",
      };
    }

    return {
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        created_at: payment.created_at,
      },
    };
  } catch (err: any) {
    const plaidError = err?.response?.data;
    console.error("[PaymentService] createPayment error:", plaidError ?? err.message);
    return {
      statusCode: 500,
      message: "Failed to create payment",
      details: plaidError?.error_message ?? err.message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getPaymentStatus
//
// Retrieves payment status from database
// ─────────────────────────────────────────────────────────────────────────────
export async function getPaymentStatus(
  userId: string,
  paymentId: string
): Promise<PaymentStatusResult | ServiceError> {
  try {
    const supabase = getSupabaseClient();

    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, amount, status, description, created_at, updated_at")
      .eq("id", paymentId)
      .eq("user_id", userId)
      .single();

    if (error || !payment) {
      return {
        statusCode: 404,
        message: "Payment not found",
      };
    }

    return {
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
      },
    };
  } catch (err: any) {
    console.error("[PaymentService] getPaymentStatus error:", err.message);
    return {
      statusCode: 500,
      message: "Failed to get payment status",
    };
  }
}

export function isServiceError(result: unknown): result is ServiceError {
  return typeof result === "object" && result !== null && "statusCode" in result;
}
