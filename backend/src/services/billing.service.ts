import {
  TransferType,
  TransferNetwork,
  ACHClass,
} from "plaid";
import { getPlaidClient } from "../config/plaid";
import { getSupabaseClient } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import type { Invoice, PlaidAccount, ServiceError } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// chargeInvoice
//
// Charges a merchant for 20% of their profit_generated via ACH.
// Flow:
//   1. Load invoice + verify it's pending
//   2. Get merchant's plaid_accounts record (access_token)
//   3. Calculate amount = profit_generated × (revenue_share_percent / 100)
//   4. Create Plaid Transfer Authorization
//   5. Create Plaid Transfer (initiates ACH debit)
//   6. Update invoice → status: "processing", store transfer_id
// ─────────────────────────────────────────────────────────────────────────────
export async function chargeInvoice(
  invoiceId: string,
  userToken?: string
): Promise<{ transfer_id: string; amount: number } | ServiceError> {
  const supabase = userToken
    ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
        global: { headers: { Authorization: `Bearer ${userToken}` } },
        auth: { autoRefreshToken: false, persistSession: false }
      })
    : getSupabaseClient();
  const plaid = getPlaidClient();

  try {
    // ── Step 1: Load the invoice ──────────────────────────────────────────────
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invError || !invoice) {
      return { statusCode: 404, message: "Invoice not found" };
    }

    if ((invoice as Invoice).status !== "pending") {
      return {
        statusCode: 400,
        message: `Invoice is already ${(invoice as Invoice).status} — cannot charge again`,
      };
    }

    const inv = invoice as Invoice;

    // ── Step 2: Calculate amount (20% of incremental profit) ─────────────────
    const revenueSharePercent = inv.revenue_share_percent ?? 20;
    const chargeAmount = parseFloat(
      ((inv.profit_generated * revenueSharePercent) / 100).toFixed(2)
    );

    if (chargeAmount <= 0) {
      return { statusCode: 400, message: "Charge amount must be greater than 0" };
    }

    console.log(
      `[BillingService] Charging user ${inv.user_id}: $${chargeAmount} ` +
      `(${revenueSharePercent}% of $${inv.profit_generated} profit)`
    );

    // ── Step 3: Get merchant's connected bank account ─────────────────────────
    const { data: plaidAccounts, error: paError } = await supabase
      .from("plaid_accounts")
      .select("*")
      .eq("user_id", inv.user_id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (paError || !plaidAccounts || plaidAccounts.length === 0) {
      return {
        statusCode: 400,
        message: "No connected bank account found for this merchant. They must link a bank account first.",
      };
    }

    const plaidAccount = plaidAccounts[0] as PlaidAccount;

    console.log(`[BillingService] Found plaid account:`, {
      id: plaidAccount.id,
      has_access_token: !!plaidAccount.access_token,
      has_account_id: !!plaidAccount.account_id,
      access_token_preview: plaidAccount.access_token?.substring(0, 20),
      account_id_preview: plaidAccount.account_id?.substring(0, 20)
    });

    // ── Step 4: Create Transfer Authorization ─────────────────────────────────
    // Authorization checks if the transfer is allowed (balance, limits, etc.)
    const authResponse = await plaid.transferAuthorizationCreate({
      access_token: plaidAccount.access_token,
      account_id: plaidAccount.account_id,
      type: TransferType.Debit,        // We pull money FROM the merchant
      network: TransferNetwork.Ach,
      amount: chargeAmount.toFixed(2),
      ach_class: ACHClass.Ccd,         // CCD = corporate/business ACH
      user: {
        legal_name: "AOVMAX Client",
      },
    });

    const authorizationId = authResponse.data.authorization.id;
    const decision = authResponse.data.authorization.decision;

    console.log(`[BillingService] Transfer authorization: ${decision} (id: ${authorizationId})`);

    if (decision === "declined") {
      const declineReason = authResponse.data.authorization.decision_rationale;
      return {
        statusCode: 402,
        message: "Transfer was declined by Plaid",
        details: declineReason?.description ?? "Unknown reason",
      };
    }

    // ── Step 5: Create the Transfer (initiates ACH debit) ────────────────────
    const transferResponse = await plaid.transferCreate({
      access_token: plaidAccount.access_token,
      account_id: plaidAccount.account_id,
      authorization_id: authorizationId,
      description: "AOVMAX fee",
    });

    const transfer = transferResponse.data.transfer;
    const transferId = transfer.id;

    console.log(`[BillingService] Transfer created: ${transferId} (status: ${transfer.status})`);

    // ── Step 6: Update invoice to processing ─────────────────────────────────
    const { error: updateError } = await supabase
      .from("invoices")
      .update({
        status: "processing",
        amount: chargeAmount,
        total_charged: chargeAmount,
        revenue_share_percent: revenueSharePercent,
      })
      .eq("id", invoiceId);

    if (updateError) {
      console.error("[BillingService] Failed to update invoice:", updateError.message);
      // Transfer was created — log this for manual reconciliation
      console.error(`[BillingService] MANUAL ACTION NEEDED: transfer ${transferId} created but invoice ${invoiceId} not updated`);
    }

    return { transfer_id: transferId, amount: chargeAmount };

  } catch (err: any) {
    const plaidError = err?.response?.data;
    console.error("[BillingService] chargeInvoice error:", plaidError ?? err.message);
    return {
      statusCode: 500,
      message: "Failed to initiate charge",
      details: plaidError?.error_message ?? err.message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getPendingInvoices
// Used by the cron job to find all invoices that need to be charged
// ─────────────────────────────────────────────────────────────────────────────
export async function getPendingInvoices(): Promise<Invoice[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[BillingService] Failed to fetch pending invoices:", error.message);
    return [];
  }

  return (data ?? []) as Invoice[];
}