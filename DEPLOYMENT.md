# Deployment Guide — IndusAI Technology

Stack: **Vercel** (frontend SPA) + **Railway** (Express API) + **Neon** (PostgreSQL) +
Cloudinary (images) + Resend (email) + Stripe (payments).

> Railway is not free forever — after the trial credit it's ~$5/month (Hobby), but
> the API never sleeps. If you want strictly $0, swap Railway for Render (the API
> sleeps after ~15 min idle); every other step is identical.

---

## 0. One-time prep (already done in this repo)
- `backend/package.json` → `build` runs `prisma generate && tsc`; `prisma` is a
  runtime dependency; Node pinned to `20.x`.
- `backend/railway.json` → builds, runs `prisma migrate deploy` on every deploy,
  health-checks `/api/health`.
- `frontend/vercel.json` → SPA routing (deep links don't 404).
- CORS reads `FRONTEND_URL` (supports a comma-separated list).

Push the repo to GitHub before continuing.

---

## 1. Database — Neon (already live)
You already have a Neon database. Copy its **connection string** (with `?sslmode=require`)
— you'll paste it as `DATABASE_URL` on Railway. Optionally create a dedicated
**production branch** in Neon so deploys don't touch your dev data.

Migrations are applied automatically on each Railway deploy (`prisma migrate deploy`).

---

## 2. Backend — Railway
1. Railway → **New Project → Deploy from GitHub repo** → pick this repo.
2. Open the service → **Settings**:
   - **Root Directory:** `backend`
   - Build/start are taken from `backend/railway.json` (leave the defaults).
3. **Variables** (Settings → Variables) — paste these:
   ```
   NODE_ENV=production
   DATABASE_URL=<your Neon connection string>
   JWT_ACCESS_SECRET=<random 32+ chars>
   JWT_REFRESH_SECRET=<different random 32+ chars>
   FRONTEND_URL=https://<your-app>.vercel.app   # set/refine after step 3
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   RESEND_API_KEY=...
   EMAIL_FROM=IndusAI <onboarding@resend.dev>   # use your verified domain in prod
   STRIPE_SECRET_KEY=sk_test_...                # or sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=                        # set after step 4
   SEED_OWNER_EMAIL=owner@indusai.pk
   SEED_OWNER_PASSWORD=Owner@IndusAI2026
   ```
   (Generate secrets with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.)
4. Deploy. Railway gives you a URL like `https://indusai-api.up.railway.app`.
   - Under **Settings → Networking**, click **Generate Domain** if it didn't already.
   - Verify it's alive: open `https://<railway-url>/api/health`.
5. **Seed the demo accounts once** (owner/admin/customer + products): Railway service →
   **⋯ → Shell** (or a one-off command) → run `npm run db:seed`.

---

## 3. Frontend — Vercel
1. Vercel → **Add New → Project** → import the same GitHub repo.
2. **Root Directory:** `frontend` (Framework auto-detects **Vite**).
3. **Environment Variables:**
   ```
   VITE_API_URL=https://<railway-url>/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # or pk_live_...
   ```
4. Deploy → you get `https://<your-app>.vercel.app`.
5. **Back on Railway**, set `FRONTEND_URL` to that exact Vercel URL and redeploy
   (this is what CORS allows). Done.

---

## 4. Stripe webhook (production payments)
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   `https://<railway-url>/api/payments/stripe/webhook`
2. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`.
3. Copy the **Signing secret** (`whsec_...`) → set `STRIPE_WEBHOOK_SECRET` on Railway → redeploy.

(The app's `/payments/stripe/confirm` endpoint already finalizes payments even
without the webhook, so card checkout works immediately; the webhook is the
robust production backstop.)

---

## 5. ⚠️ Auth cookie across two domains (important)
The refresh token is an **httpOnly cookie**. With the frontend on `vercel.app` and
the API on `up.railway.app` (two different sites), the cookie is `SameSite=None; Secure`
— which works in Chrome/Edge/Firefox but **Safari and strict privacy modes may block it**.

Two robust fixes (pick one):

**A. Custom domain with a shared root (recommended).**
Point `app.indusai.pk` → Vercel and `api.indusai.pk` → Railway. Same registrable
domain = first-party cookies, works everywhere. Set:
- Vercel env `VITE_API_URL=https://api.indusai.pk/api`
- Railway env `FRONTEND_URL=https://app.indusai.pk`

**B. Same-origin proxy (no custom domain needed).**
Make Vercel proxy `/api` to Railway so the browser only ever talks to Vercel.
Replace `frontend/vercel.json` with:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<railway-url>/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
…and set Vercel env `VITE_API_URL=/api`. (The `/api` rule must come **before** the
catch-all.) Now the cookie is first-party to your Vercel domain.

If you only target Chrome/Edge during a demo, the default cross-site setup works as-is.

---

## 6. Before inviting real users
- **Email:** verify a domain at resend.com/domains, set `EMAIL_FROM` to it, then
  re-enable verification — flip `isVerified` back to `false` and restore the
  `createOTPRecord` + `sendVerificationEmail` lines in
  `backend/src/services/auth.service.ts`, and point `RegisterPage` back to
  `/auth/verify-otp`.
- **Stripe:** switch the test keys (`sk_test_`/`pk_test_`) to live keys.
- **Secrets:** rotate `JWT_*` and the seeded owner password.

---

## Quick reference — env vars
| Variable | Where | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Railway | Neon connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Railway | 32+ random chars each |
| `FRONTEND_URL` | Railway | Vercel URL (CORS); comma-separate for multiple |
| `CLOUDINARY_*` | Railway | image uploads |
| `RESEND_API_KEY` / `EMAIL_FROM` | Railway | email |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Railway | payments |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` | Railway | seed script |
| `VITE_API_URL` | Vercel | `https://<railway>/api` (or `/api` with proxy) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Vercel | publishable key (public) |
