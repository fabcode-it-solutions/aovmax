import { getSupabaseClient } from "../config/supabase";
import type {
  CreatePaymentBody,
  CreatePaymentResult,
  ServiceError,
} from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// createTestPayment - FOR TESTING ONLY (bypasses Plaid)
// ─────────────────────────────────────────────────────────────────────────────
export async function createTestPayment(
  userId: string,
  body: CreatePaymentBody
): Promise<CreatePaymentResult | ServiceError> {
  const { payment_method_id, amount, description } = body;

  try {
    const supabase = getSupabaseClient();

    // Verify payment method exists
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

    // Create test payment (no Plaid call)
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        payment_method_id,
        plaid_payment_id: `test-${Date.now()}`,
        amount,
        status: "pending",
        description: description || "Test payment",
      })
      .select()
      .single();

    if (insertError || !payment) {
      console.error("[TestPayment] Failed to save payment:", insertError?.message);
      return {
        statusCode: 500,
        message: "Failed to save payment record",
        details: insertError?.message,
      };
    }

    console.log(`[TestPayment] Test payment created: ${payment.id}`);

    return {
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        created_at: payment.created_at,
      },
    };
  } catch (err: any) {
    console.error("[TestPayment] Error:", err.message);
    return {
      statusCode: 500,
      message: "Failed to create test payment",
      details: err.message,
    };
  }
}

export function isServiceError(result: unknown): result is ServiceError {
  return typeof result === "object" && result !== null && "statusCode" in result;
}
