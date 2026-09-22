import type { Response } from "express";
import { chargeInvoice } from "../services/billing.service";
import { isServiceError } from "../types"; // Reusing the type guard
import type { AuthenticatedRequest } from "../types";

export async function handleChargeInvoice(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    const { invoiceId } = req.body;

    if (!invoiceId) {
        res.status(400).json({ error: "invoiceId is required" });
        return;
    }

    // Extract JWT token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    const result = await chargeInvoice(invoiceId, token);

    if (isServiceError(result)) {
        res.status(result.statusCode).json({
            error: result.message,
            ...(result.details && { details: result.details }),
        });
        return;
    }

    res.status(200).json({ success: true, ...result });
}
