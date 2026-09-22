import type { Response } from "express";
import { getSupabaseClient } from "../config/supabase";
import type { AuthenticatedRequest } from "../types";

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("profiles")
      .select("company_name, contact_name, revenue_share_percent")
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("[profile] Error:", (err as Error).message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
