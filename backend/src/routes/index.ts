import { Router } from "express";
import plaidRoutes from "./plaid.routes";
import profileRoutes from "./profile.routes";
import paymentRoutes from "./payment.routes";
import billingRoutes from "./billing.routes";
import webhookRoutes from "./webhook.routes";
import debugRoutes from "./debug.routes";

const router = Router();

router.use("/plaid", plaidRoutes);
router.use("/profile", profileRoutes);
router.use("/payment", paymentRoutes);
router.use("/billing", billingRoutes);
router.use("/webhook", webhookRoutes);
router.use("/debug", debugRoutes);

export default router;