import type { Response } from "express";
import { getSupabaseClient } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import type { AuthenticatedRequest } from "../types";

export async function handleDebugPlaidAccounts(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = token
      ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : getSupabaseClient();

    const { data, error } = await supabase
      .from("plaid_accounts")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({
      user_id: req.user.id,
      count: data?.length || 0,
      accounts: data
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleDebugInvoice(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { invoiceId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = token
      ? createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : getSupabaseClient();

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
