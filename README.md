# AOVMAX

A full-stack billing and payments platform that connects to customers' bank accounts via **Plaid** and automates recurring, usage-based billing. Built as a production-grade example of a modern SaaS billing system — secure account linking, automated payment collection, and an admin dashboard for oversight.

## What it does

- **Bank account linking** — customers securely connect their bank via Plaid Link (`react-plaid-link`)
- **Automated recurring billing** — a scheduled job (`node-cron`) runs weekly billing cycles against linked accounts
- **Payment processing & webhooks** — dedicated services handle payment execution, status tracking, and Plaid webhook events
- **Admin dashboard** — internal view for monitoring customers, billing runs, and payment status
- **Auth & user management** — email/password auth with login, password reset, and protected routes
- **Marketing site** — a polished landing page (hero, comparison, FAQ, proof/testimonial sections) for customer acquisition

## Architecture

This is a monorepo with two independently deployable apps:

```
aovmax/
├── frontend/   React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS
└── backend/    Node.js + Express + TypeScript
```

**Frontend** — `frontend/`
- Vite + React 18 + TypeScript
- shadcn/ui component library on Radix primitives, styled with Tailwind CSS
- React Router for routing, TanStack Query for data fetching
- Supabase client for auth/session handling
- Vitest + Testing Library for unit tests

**Backend** — `backend/`
- Express + TypeScript API
- Layered structure: routes → controllers → services, with request validation and auth middleware
- Plaid SDK integration for account linking, transactions, and webhooks
- Supabase as the data layer
- `node-cron` scheduled job for weekly billing runs

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Data & Auth | Supabase (Postgres, Auth) |
| Payments | Plaid API |
| Tooling | ESLint, Vitest, ts-node-dev |

## Project structure

- `frontend/` — customer-facing app and marketing site ([details](frontend/README.md), [Plaid setup](frontend/PLAID_SETUP.md))
- `backend/` — API server, billing engine, and Plaid/webhook integration ([security notes](backend/SECURITY.md), [testing guide](backend/TESTING.md))

## Local development

Each app runs independently — see the README in `frontend/` and `backend/` for setup and environment variable requirements.

```bash
# backend
cd backend && npm install && npm run dev

# frontend
cd frontend && npm install && npm run dev
```

---

This repository is shared for portfolio/review purposes. Environment secrets, API keys, and production credentials are excluded and must be configured separately per environment.
