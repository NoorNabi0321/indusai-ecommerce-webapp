# IndusAI Technology — E-Commerce Platform

A production-grade, AI-powered full-stack e-commerce platform selling **shirts, shoes,
jewellery, and electronics**, built for the Pakistani market. Three roles
(**Customer**, **Administrator**, **Owner**), AI features (smart search, recommendations,
support chatbot, sales forecasting), local + international payments, and full reporting.

> **Developer:** Noor Nabi Shaikh · **Version:** 1.0 (Development)

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| **Frontend** | React 18 + TypeScript · Vite · Tailwind CSS (dark-first) · Shadcn/ui · Framer Motion · Zustand · React Query · Recharts |
| **Backend**  | Node.js 20 · Express · TypeScript · Prisma · PostgreSQL (Neon) · JWT auth |
| **AI**       | OpenAI (embeddings + chatbot) · TensorFlow.js (recommendations + forecasting) |
| **Payments** | Stripe · JazzCash · Easypaisa · Cash on Delivery |
| **Services** | Cloudinary (images) · SendGrid (email/OTP) · Twilio (SMS) · Sentry |
| **Hosting**  | Vercel (frontend) · Railway (backend) · Neon (DB) · Cloudflare (CDN) |

---

## Monorepo Structure

```
indusai-ecommerce/
├── frontend/        # React + TypeScript app (Vite)
├── backend/         # Node + Express + TypeScript API (Prisma)
├── CLAUDE.md        # Agent master instructions + phase tracker
├── IMPLEMENTATION_PLAN.md
├── IndusAI_Complete_Design_Strategy.md
├── API_Credentials_Guide.md
└── .env.example     # Full environment variable template
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 20
- npm ≥ 10
- A PostgreSQL database (Neon recommended — needed from Phase 2)

### Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure environment
cp .env.example backend/.env      # then fill in values
# Frontend: create frontend/.env with VITE_* keys (see .env.example bottom)

# 3. (Phase 2+) Set up the database
npm run db:migrate
npm run db:seed

# 4. Run both apps (frontend :5173, backend :3000)
npm run dev
```

---

## Common Commands

```bash
npm run dev            # Run frontend + backend together
npm run dev:frontend   # Frontend only (Vite, :5173)
npm run dev:backend    # Backend only (:3000)
npm run build          # Production build (both)
npm run lint           # Lint all workspaces

npm run db:migrate     # Run Prisma migrations
npm run db:seed        # Seed development data
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset + reseed (DEV ONLY)
```

---

## Credential Collection Order (Just-In-Time)

You do **not** need all credentials up front. Fetch each as its phase arrives:

| Phase | Service(s) needed |
|-------|-------------------|
| 1 — Foundation | None (JWT secrets self-generated) |
| 2 — DB & Auth  | Neon, SendGrid |
| 3 — Products   | Cloudinary |
| 9 — AI         | OpenAI |
| 10 — Payments  | Stripe ✅, JazzCash, **Easypaisa (request early — 2-5 day lead)** |
| 11 — Notify    | Twilio (optional) |
| 14 — Deploy    | Vercel, Railway, Sentry, Cloudflare |

See [`API_Credentials_Guide.md`](./API_Credentials_Guide.md) for step-by-step instructions.

---

## Development Process

Development follows [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — **14 phases, 58
subphases**, strictly dependency-ordered. The current phase is tracked in
[`CLAUDE.md`](./CLAUDE.md) §7. Do not skip ahead.

---

*IndusAI Technology E-Commerce Platform — aligned with SRS v1.0 (May 2026).*
