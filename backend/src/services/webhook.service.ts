import { getSupabaseClient } from "../config/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// handlePlaidWebhook
//
// Plaid sends webhook events when transfer status changes.
// ACH takes 1-3 business days — this is how we know if payment succeeded.
//
// Key events:
//   TRANSFER → TRANSFER_EVENTS_UPDATE  (transfer status changed)
//   ITEM     → ERROR                   (bank connection broke)
//   ITEM     → USER_PERMISSION_REVOKED (merchant disconnected bank)
// ─────────────────────────────────────────────────────────────────────────────
export async function handlePlaidWebhook(
  webhookType: string,
  webhookCode: string,
  body: Record<string, any>
): Promise<void> {
  console.log(`[WebhookService] Received: ${webhookType}/${webhookCode}`);

  switch (webhookType) {
    case "TRANSFER":
      await handleTransferWebhook(webhookCode, body);
      break;
    case "ITEM":
      await handleItemWebhook(webhookCode, body);
      break;
    default:
      console.log(`[WebhookService] Unhandled webhook type: ${webhookType}`);
  }
}

// ─── Transfer events ─────────────────────────────────────────────────────────
async function handleTransferWebhook(
  webhookCode: string,
  body: Record<string, any>
): Promise<void> {
  if (webhookCode !== "TRANSFER_EVENTS_UPDATE") return;

  const supabase = getSupabaseClient();
  const plaid = (await import("../config/plaid")).getPlaidClient();

  try {
    // Sync transfer events from Plaid
    let hasMore = true;
    let afterId = 0;

    while (hasMore) {
      const response = await plaid.transferEventSync({ after_id: afterId });
      const events = response.data.transfer_events;
      hasMore = response.data.has_more;

      for (const event of events) {
        afterId = event.event_id;
        await processTransferEvent(event);
      }
    }
  } catch (err) {
    console.error("[WebhookService] Transfer sync error:", (err as Error).message);
  }
}

async function processTransferEvent(event: any): Promise<void> {
  const supabase = getSupabaseClient();
  const { transfer_id, event_type } = event;

  console.log(`[WebhookService] Transfer ${transfer_id} event: ${event_type}`);

  // Map Plaid transfer status → invoice status
  const statusMap: Record<string, string> = {
    settled: "paid",   // Money successfully transferred
    failed: "failed",  // Transfer failed
    returned: "failed", // ACH returned (e.g. insufficient funds)
    cancelled: "failed",
  };

  const newInvoiceStatus = statusMap[event_type];
  if (!newInvoiceStatus) return; // Ignore intermediate statuses

  // Find the invoice that matches this transfer
  // We store transfer description as "AOVMAX fee - Invoice INV-XXX"
  // So we need to find invoice by matching the transfer context
  // Best approach: store transfer_id on invoice — for now we log it
  console.log(
    `[WebhookService] Transfer ${transfer_id} → ${event_type} → invoice status: ${newInvoiceStatus}`
  );

  // Update invoice status
  // Note: this requires transfer_id to be stored on the invoice
  // This is handled via the plaid_transfer_id column (add to migration if needed)
  const { error } = await supabase
    .from("invoices")
    .update({
      status: newInvoiceStatus,
      ...(newInvoiceStatus === "paid" ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq("plaid_transfer_id", transfer_id);

  if (error) {
    console.error(
      `[WebhookService] Failed to update invoice for transfer ${transfer_id}:`,
      error.message
    );
  } else {
    console.log(`[WebhookService] Invoice updated to: ${newInvoiceStatus}`);
  }
}

// ─── Item events (bank connection health) ────────────────────────────────────
async function handleItemWebhook(
  webhookCode: string,
  body: Record<string, any>
): Promise<void> {
  const supabase = getSupabaseClient();
  const itemId = body.item_id;

  switch (webhookCode) {
    case "ERROR":
      console.error(`[WebhookService] Plaid item error for item: ${itemId}`, body.error);
      break;

    case "USER_PERMISSION_REVOKED":
      // Merchant disconnected their bank — deactivate their plaid_account
      console.warn(`[WebhookService] User revoked permission for item: ${itemId}`);
      await supabase
        .from("plaid_accounts")
        .delete()
        .eq("item_id", itemId);
      break;

    case "PENDING_EXPIRATION":
      console.warn(`[WebhookService] Access token expiring for item: ${itemId}`);
      break;

    default:
      console.log(`[WebhookService] Unhandled item event: ${webhookCode}`);
  }
}