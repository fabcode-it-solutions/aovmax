import type { Response, NextFunction } from "express";
import { getSupabaseClient } from "../config/supabase";
import type { AuthenticatedRequest } from "../types";

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or malformed authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const supabase = getSupabaseClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[auth] Unexpected error:", (err as Error).message);
    res.status(500).json({ error: "Authentication failed" });
  }
}