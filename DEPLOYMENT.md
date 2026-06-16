# 🚀 Go Live — Railway (API) + Vercel (Frontend)

Follow these in order. The **actual secret values** to paste are in
`DEPLOY_VALUES.local.md` (gitignored — open it next to this guide and copy from it).
Your database (Neon) and migrations are already handled automatically on deploy.

> Why values aren't written here: `DEPLOYMENT.md` is committed to GitHub. Real
> secrets live only in `DEPLOY_VALUES.local.md`, which is never pushed.

---

## STEP 1 — Deploy the backend on Railway

1. Railway → **New Project** → **Deploy from GitHub repo** → select
   `indusai-ecommerce-webapp`. (Authorize GitHub if asked.)
2. It creates a service. Open it → **Settings** tab.
3. **Settings → Source → Root Directory** → type `backend` → save.
   *(Build & start commands come from `backend/railway.json` automatically — leave them.)*
4. Go to the **Variables** tab → click **Raw Editor** → paste the entire Railway
   block from `DEPLOY_VALUES.local.md` → **Save**.
   - ⚠️ Do **not** add a `PORT` variable — Railway sets it for you.
5. Railway redeploys. Watch the **Deployments → View Logs** until you see
   `🚀 IndusAI API running`. The build runs `prisma migrate deploy` (your DB tables)
   then starts the server.

### Get your API URL
6. **Settings → Networking → Public Networking** → **Generate Domain**.
   You'll get something like `https://indusai-ecommerce-webapp-production.up.railway.app`.
7. Test it: open `https://YOUR-API.up.railway.app/api/health` in the browser →
   you should see a small JSON `{"status":"ok",...}`. ✅ Backend is live.

### Seed the login accounts (one time)
8. In the Railway service → top-right **⋯** (or the **Settings → Deploy** area) →
   open a **Shell**/one-off command and run:
   ```
   npm run db:seed
   ```
   This creates the Owner / Admin / Customer accounts + the 20 demo products.
   *(If you can't find a Shell on the free plan, temporarily change the start
   command in `backend/railway.json` to `npx prisma migrate deploy && npm run db:seed && node dist/server.js`, push, let it deploy once, then revert.)*

---

## STEP 2 — Deploy the frontend on Vercel

1. Vercel → **Add New… → Project** → **Import** `indusai-ecommerce-webapp`.
2. **Root Directory** → click **Edit** → choose `frontend`. (Framework = **Vite**, auto-detected.)
3. Expand **Environment Variables** and add the **2 variables** from the Vercel
   table in `DEPLOY_VALUES.local.md`:
   - `VITE_API_URL` = your Railway URL **+ `/api`** (e.g. `https://YOUR-API.up.railway.app/api`)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = the `pk_test_…` value
4. Click **Deploy**. After ~1–2 min you get `https://YOUR-APP.vercel.app`. ✅ Frontend is live.

---

## STEP 3 — Connect the two (CORS)

1. Copy your Vercel URL (e.g. `https://indusai-ecommerce-webapp.vercel.app`).
2. Back in **Railway → Variables**, set:
   ```
   FRONTEND_URL = https://YOUR-APP.vercel.app
   ```
   (no trailing slash) → save. Railway redeploys automatically.
3. Open your Vercel URL and **log in** with `owner@indusai.pk` / `Owner@IndusAI2026`.
   If login works, you're done with the core deploy. 🎉

> **Safari/strict-privacy note:** because the site and API are on different
> domains, the login cookie is cross-site. It works in Chrome/Edge/Firefox. If you
> need Safari too, do the optional **same-origin proxy** at the bottom.

---

## STEP 4 — Stripe webhook (so card payments finalize in production)

1. Stripe Dashboard (test mode) → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://YOUR-API.up.railway.app/api/payments/stripe/webhook`
3. **Select events**: `payment_intent.succeeded` and `payment_intent.payment_failed`.
4. Create it → copy the **Signing secret** (`whsec_…`).
5. Railway → **Variables** → set `STRIPE_WEBHOOK_SECRET = whsec_…` → save (redeploys).

*(Card checkout already works without this via the server-side confirm step; the
webhook is the production backstop.)*

---

## ✅ You're live
- Storefront: `https://YOUR-APP.vercel.app`
- Admin panel: `https://YOUR-APP.vercel.app/admin/dashboard`
- Owner panel: `https://YOUR-APP.vercel.app/owner/dashboard`
- Test card at checkout: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Common issues
| Symptom | Fix |
|---------|-----|
| Railway build fails on Prisma | Confirm **Root Directory = `backend`**. |
| Frontend loads but every API call fails (CORS) | `FRONTEND_URL` on Railway must equal your exact Vercel URL (no trailing slash). |
| 404 on `/admin/...` after refresh | `frontend/vercel.json` handles this — make sure Root Directory is `frontend` so Vercel reads it. |
| Login works then logs you out / fails on Safari | Use the same-origin proxy below. |
| First request is slow | Neon cold-start (free tier) — normal, only the first hit. |

---

## (Optional) Same-origin proxy — makes auth work on ALL browsers
Instead of pointing the frontend at Railway directly, let Vercel proxy `/api`:

1. Replace `frontend/vercel.json` with:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://YOUR-API.up.railway.app/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Change the Vercel env var `VITE_API_URL` to just `/api`.
3. Redeploy Vercel. Now the browser only talks to your Vercel domain → the login
   cookie is first-party and works everywhere.

---

## Before real users (later)
- **Email:** verify a domain at resend.com/domains, set `EMAIL_FROM` to it, then
  re-enable OTP (flip `isVerified` back + restore the OTP lines in
  `auth.service.ts`, point `RegisterPage` to `/auth/verify-otp`).
- **Stripe:** swap `sk_test_`/`pk_test_` for live keys.
- **Secrets:** rotate the JWT secrets and the seeded owner password.
