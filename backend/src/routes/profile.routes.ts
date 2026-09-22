import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getProfile } from "../controllers/profile.controller";
import type { AuthenticatedRequest } from "../types";

const router = Router();

router.get("/", requireAuth as any, (req, res) =>
  getProfile(req as AuthenticatedRequest, res)
);

export default router;
