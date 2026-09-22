import cron from "node-cron";
import { getSupabaseClient } from "../config/supabase";
import { chargeInvoice } from "../services/billing.service";
import { isServiceError } from "../services/plaid.service";

/**
 * Weekly Billing Job
 * Runs every Monday at 9:00 AM
 */
export function initWeeklyBillingJob() {
    // CRON Schedule: '0 9 * * 1' (At 09:00 on Monday)
    cron.schedule("0 9 * * 1", async () => {
        console.log("[Job] Starting weekly billing cycle...");

        try {
            const supabase = getSupabaseClient();

            // 1. Fetch all pending invoices
            const { data: pendingInvoices, error } = await supabase
                .from("invoices")
                .select("id, user_id")
                .eq("status", "pending");

            if (error) {
                console.error("[Job] Failed to fetch pending invoices:", error.message);
                return;
            }

            console.log(`[Job] Found ${pendingInvoices?.length || 0} pending invoices`);

            // 2. Trigger charge for each
            for (const invoice of pendingInvoices || []) {
                console.log(`[Job] Charging invoice ${invoice.id} for user ${invoice.user_id}`);

                const result = await chargeInvoice(invoice.user_id, invoice.id);

                if (isServiceError(result)) {
                    console.error(`[Job] Error charging invoice ${invoice.id}:`, result.message);
                } else {
                    console.log(`[Job] Successfully initiated charge for invoice ${invoice.id}`);
                }
            }

            console.log("[Job] Weekly billing cycle completed");
        } catch (err: any) {
            console.error("[Job] Critical error in weekly billing job:", err.message);
        }
    });

    console.log("✅ Weekly billing job initialized (Mondays 9am)");
}
