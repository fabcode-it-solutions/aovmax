import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes";
import { initWeeklyBillingJob } from "./jobs/weekly-billing.job";

// ─── Validate required env vars on startup ────────────────────────────────────
const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_KEY",
  "PLAID_CLIENT_ID",
  "PLAID_SECRET",
  "PLAID_ENV",
] as const;

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("❌  Missing required environment variables:", missing.join(", "));
  process.exit(1);
}

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' })); // Limit request size

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    plaid_env: process.env.PLAID_ENV,
    has_service_role: process.env.HAS_SERVICE_ROLE === "true",
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api", routes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Initialize Jobs ──────────────────────────────────────────────────────────
initWeeklyBillingJob();

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  AOVMAX backend running`);
  console.log(`    URL         : http://localhost:${PORT}`);
  console.log(`    Plaid env   : ${process.env.PLAID_ENV}`);
  console.log(`    Service role: ${process.env.HAS_SERVICE_ROLE === "true" ? "✅ enabled" : "⚠️  not set (anon key mode)"}`);
  console.log(`    CORS allow  : ${process.env.ALLOWED_ORIGIN ?? "http://localhost:5173"}\n`);
});