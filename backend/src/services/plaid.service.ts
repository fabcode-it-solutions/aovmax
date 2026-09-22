import { Products, CountryCode } from "plaid";
import { getPlaidClient } from "../config/plaid";
import { getSupabaseClient } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import type { ExchangeTokenBody, ServiceError } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// createLinkToken
// ─────────────────────────────────────────────────────────────────────────────
export async function createLinkToken(
  userId: string
): Promise<{ link_token: string } | ServiceError> {
  try {
    const plaid = getPlaidClient();

    console.log(`[PlaidService] Creating link token for user: ${userId}`);

    const response = await plaid.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "AOVMAX",
      products: [Products.Auth],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return { link_token: response.data.link_token };
  } catch (err: any) {
    const plaidError = err?.response?.data;
    console.error("[PlaidService] createLinkToken error:", plaidError ?? err.message);
    return {
      statusCode: 500,
      message: "Failed to create Plaid link token",
      details: plaidError?.error_message ?? err.message,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// exchangeToken
// Saves to both plaid_accounts (sensitive) and payment_methods (safe/masked)
// plaid_accounts has open RLS — anon key can write to it
// ─────────────────────────────────────────────────────────────────────────────
export async function exchangeToken(
  userId: string,
  body: ExchangeTokenBody,
  userToken?: string
): Promise<{ account: object } | ServiceError> {
  const { public_token, account_id, institution_name, account_name, account_subtype, mask } = body;

  try {
    const plaid = getPlaidClient();
    const supabase = userToken
      ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
          global: { headers: { Authorization: `Bearer ${userToken}` } },
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : getSupabaseClient();

    console.log(`[PlaidService] Exchanging token for user: ${userId}`);

    // ── Step 1: Exchange public_token → access_token ──────────────────────────
    const exchangeResponse = await plaid.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log(`[PlaidService] Got access_token for item: ${itemId}`);

    // ── Step 2: Save to plaid_accounts (stores access_token) ─────────────────
    // This table has open RLS so anon key works fine
   const { data: plaidAccount, error: plaidError } = await supabase
      .from("plaid_accounts")
      .insert({
        user_id: userId,
        access_token: accessToken,
        item_id: itemId,
        account_id: account_id,
        institution_name: institution_name ?? null,
        mask: mask,
      })
      .select()
      .single();

    if (plaidError || !plaidAccount) {
      console.error("[PlaidService] plaid_accounts insert error:", plaidError?.message);
      return {
        statusCode: 500,
        message: "Failed to save bank account",
        details: plaidError?.message,
      };
    }

    console.log(`[PlaidService] plaid_accounts saved: ${plaidAccount.id}`);

    // ── Step 3: Check if this is their first payment method ───────────────────
    const { data: existing } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("user_id", userId);

    const isFirstMethod = !existing || existing.length === 0;

    // ── Step 4: Save safe/masked data to payment_methods ─────────────────────
    const { data: paymentMethod, error: pmError } = await supabase
      .from("payment_methods")
      .insert({
        user_id: userId,
        type: "bank_account",
        provider_id: itemId,          // plaid item_id as reference
        bank_name: institution_name ?? "Bank",
        last_four: mask,
        account_type: account_subtype ?? "checking",
        is_default: isFirstMethod,
      })
      .select()
      .single();

    if (pmError || !paymentMethod) {
      console.error("[PlaidService] payment_methods insert error:", pmError?.message);
      return {
        statusCode: 500,
        message: "Failed to save payment method",
        details: pmError?.message,
      };
    }

    console.log(`[PlaidService] payment_methods saved: ${paymentMethod.id}`);

    return {
      account: {
        id: plaidAccount.id,
        user_id: userId,
        institution_name: institution_name ?? "Bank",
        mask,
        account_subtype: account_subtype ?? "checking",
        is_default: isFirstMethod,
      },
    };
  } catch (err: any) {
    const plaidError = err?.response?.data;
    console.error("[PlaidService] exchangeToken error:", plaidError ?? err.message);
    return {
      statusCode: 500,
      message: "Failed to link bank account",
      details: plaidError?.error_message ?? err.message,
    };
  }
}