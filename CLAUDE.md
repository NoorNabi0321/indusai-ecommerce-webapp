# CLAUDE.md — IndusAI Technology E-Commerce Platform
## Master Instructions for Claude Code Agent

> This file is read automatically by Claude Code at the start of every session.
> It contains all project context, rules, conventions, and phase tracking.
> Do NOT delete or modify this file unless explicitly instructed.

---

## 1. Project Identity

```
Project:    IndusAI Technology E-Commerce Platform
Version:    1.0 (Development)
Type:       Production-Level AI-Powered E-Commerce Web Application
Developer:  Noor Nabi Shaikh
SRS Date:   24-May-2026
```

**What this app does:**
A full-stack e-commerce platform selling shirts, shoes, jewellery, and electronics.
It has three user roles (Customer, Administrator, Owner), AI-powered features
(product recommendations, smart search, customer support chatbot, sales predictions),
multiple Pakistani payment methods, and a full reporting system.

---

## 2. Technology Stack

### Frontend
```
Framework:      React 18 with TypeScript (strict mode)
Routing:        React Router v6
Styling:        Tailwind CSS v3 (dark-first theme)
Components:     Shadcn/ui + Radix UI primitives
Animations:     Framer Motion v11
Forms:          React Hook Form + Zod validation
State:          Zustand (global) + React Query (server state)
HTTP:           Axios with interceptors
Charts:         Recharts
Rich Text:      Tiptap
Image Upload:   Cloudinary React SDK
```

### Backend
```
Runtime:        Node.js 20 LTS
Framework:      Express.js with TypeScript
ORM:            Prisma
Database:       PostgreSQL (Neon hosted)
Auth:           JWT (access + refresh tokens)
Password:       bcrypt
File Upload:    Cloudinary API
Email:          SendGrid
SMS OTP:        Twilio Verify (optional, Email OTP primary)
Validation:     Zod
Rate Limiting:  express-rate-limit
Logging:        Winston
Error Track:    Sentry
```

### AI Services
```
Recommendations:  TensorFlow.js (Node backend)
Smart Search:     OpenAI Embeddings API (text-embedding-3-small)
Chatbot:          OpenAI Chat Completions (gpt-4o-mini)
Sales Forecast:   TensorFlow.js time series model
```

### Payments
```
International:  Stripe API
Local Wallet:   JazzCash Merchant API
Local Wallet:   Easypaisa Business API
Offline:        Cash on Delivery (internal logic)
```

### Infrastructure
```
Frontend Host:  Vercel
Backend Host:   Railway
Database:       Neon PostgreSQL
Images:         Cloudinary
CDN:            Cloudflare
Monitoring:     Sentry
```

---

## 3. Project Structure

```
indusai-ecommerce/
├── CLAUDE.md                    ← This file
├── IMPLEMENTATION_PLAN.md       ← Phase-by-phase development plan
├── .env.example                 ← Environment variable template
├── .gitignore
├── README.md
│
├── frontend/                    ← React + TypeScript app
│   ├── public/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── router/
│   │   │   └── index.tsx        ← All route definitions
│   │   ├── components/
│   │   │   ├── ui/              ← Shadcn primitives
│   │   │   ├── layout/          ← Navbar, Footer, Sidebars
│   │   │   ├── product/         ← ProductCard, ProductGrid, Gallery
│   │   │   ├── cart/            ← CartDrawer, OrderSummary
│   │   │   ├── auth/            ← AuthLayout, OTPInput, PasswordStrength
│   │   │   ├── common/          ← Shared reusable components
│   │   │   ├── charts/          ← Dashboard chart components
│   │   │   └── ai/              ← ChatWidget, RecommendationStrip
│   │   ├── pages/
│   │   │   ├── auth/            ← Login, Register, OTP, ForgotPassword, ResetPassword
│   │   │   ├── customer/        ← Homepage, Shop, Product, Cart, Checkout, etc.
│   │   │   ├── admin/           ← Admin dashboard + all admin pages
│   │   │   └── owner/           ← Owner dashboard + all owner pages
│   │   ├── stores/              ← Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── cartStore.ts
│   │   │   └── uiStore.ts
│   │   ├── hooks/               ← Custom React hooks
│   │   ├── lib/
│   │   │   ├── axios.ts         ← Axios instance + interceptors
│   │   │   ├── utils.ts         ← Utility functions
│   │   │   └── constants.ts     ← App-wide constants
│   │   ├── types/               ← TypeScript type definitions
│   │   │   ├── api.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   └── user.types.ts
│   │   └── styles/
│   │       └── globals.css      ← Tailwind base + custom CSS vars
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                     ← Node.js + Express + TypeScript
│   ├── src/
│   │   ├── server.ts            ← Entry point
│   │   ├── app.ts               ← Express app setup
│   │   ├── config/
│   │   │   ├── env.ts           ← Env validation with Zod
│   │   │   ├── database.ts      ← Prisma client singleton
│   │   │   └── cloudinary.ts    ← Cloudinary config
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── payment.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── controllers/         ← Route handler functions
│   │   ├── services/            ← Business logic layer
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    ← JWT verification
│   │   │   ├── role.middleware.ts    ← RBAC enforcement
│   │   │   ├── validate.middleware.ts← Zod request validation
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── errorHandler.ts      ← Global error handler
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── email.ts         ← SendGrid wrapper
│   │   │   ├── otp.ts           ← OTP generation + verification
│   │   │   └── logger.ts        ← Winston logger
│   │   └── types/               ← Shared TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma        ← Database schema
│   │   ├── migrations/
│   │   └── seed.ts              ← Seed data for development
│   ├── tsconfig.json
│   └── package.json
│
└── docs/                        ← Documentation
    ├── API.md                   ← API endpoint reference
    └── DESIGN_STRATEGY.md       ← UI/UX design reference
```

---

## 4. Coding Standards & Conventions

### TypeScript Rules
```
- Strict mode enabled in tsconfig (strict: true)
- No use of `any` type — use `unknown` and narrow, or define proper types
- All function parameters and return types must be explicitly typed
- Use interfaces for objects, type aliases for unions/primitives
- Enums for fixed sets of values (UserRole, OrderStatus, PaymentMethod, etc.)
```

### Naming Conventions
```
Files:          kebab-case          → product-card.tsx, auth.routes.ts
Components:     PascalCase          → ProductCard, CartDrawer
Functions:      camelCase           → getUserById, formatPrice
Constants:      UPPER_SNAKE_CASE    → MAX_FILE_SIZE, JWT_EXPIRES_IN
Types/Interfaces: PascalCase        → ProductType, OrderInterface
Zod schemas:    camelCase + Schema  → createProductSchema, loginSchema
Prisma models:  PascalCase          → User, Product, Order
API routes:     kebab-case plural   → /api/products, /api/orders
```

### React Component Rules
```
- Functional components only (no class components)
- Props interface defined above each component
- Default exports for page components, named exports for shared components
- Custom hooks prefixed with "use" → useCart, useAuth, useProducts
- No inline styles — use Tailwind classes only
- Framer Motion variants defined outside component (prevents re-creation)
- Always handle loading, error, and empty states
```

### API Response Format
```typescript
// Success
{
  success: true,
  data: T,
  message?: string,
  pagination?: { page, limit, total, totalPages }
}

// Error
{
  success: false,
  error: {
    code: string,      // e.g. "PRODUCT_NOT_FOUND"
    message: string,   // human-readable
    details?: object   // validation errors, etc.
  }
}
```

### Error Handling
```
- All async route handlers wrapped in try/catch
- Use a custom AppError class that extends Error
- Global error handler middleware catches all unhandled errors
- Never expose stack traces or internal details in production
- Log all errors with Winston, send critical errors to Sentry
```

### Environment Variables
```
- All env vars validated at startup using Zod in config/env.ts
- App refuses to start if required vars are missing
- Never access process.env directly outside config/env.ts
- Separate .env files: .env.development, .env.production
```

### Security Rules
```
- JWT: access token 15min, refresh token 7d, stored in httpOnly cookie
- Passwords: bcrypt with saltRounds=12
- All inputs validated with Zod before processing
- Rate limiting on all auth endpoints (5 req/15min)
- CORS configured for specific frontend origin only
- SQL injection: impossible with Prisma parameterized queries
- XSS: sanitize any user HTML before storage
- Helmet.js for security headers
- HTTPS enforced in production
```

---

## 5. Database Schema Overview

```
Core models:
  User          — customers, admins, owners (role field distinguishes)
  Product       — all product data
  ProductVariant— size/colour/stock per product
  ProductImage  — multiple images per product
  Category      — shirts, shoes, jewellery, electronics
  Order         — order header
  OrderItem     — line items within an order
  Address       — saved delivery addresses
  Payment       — payment records linked to orders
  Review        — product reviews by customers
  Wishlist      — customer wishlists
  CartItem      — persisted cart items
  Notification  — in-app notifications
  DeletionRequest— admin deletion requests awaiting owner approval
  OTPRecord     — OTP codes with expiry
  RefreshToken  — refresh token whitelist
  AuditLog      — all significant actions (owner view)
```

---

## 6. Role-Based Access Control

```
CUSTOMER:
  - Browse products, search, filter
  - Manage own cart, wishlist, profile, addresses
  - Place orders, track orders, request returns
  - Write reviews (only for purchased products)
  - Use AI chatbot

ADMINISTRATOR:
  - All customer permissions
  - Create, edit, manage products and inventory
  - View and update order statuses
  - View customer list and profiles
  - Generate and export reports
  - Cannot permanently delete (must request Owner approval)
  - Cannot manage other admins or owners
  - Cannot view financial stats

OWNER:
  - All administrator permissions
  - Approve or reject deletion requests
  - Full financial statistics and analytics
  - Manage administrator accounts (create, suspend, delete)
  - System configuration
  - Platform audit log
  - AI sales predictions
```

---

## 7. Phase Tracking

Track current phase here. Update as each phase completes.

```
CURRENT PHASE: Phase 10 — Payments (10.1 + 10.4 done; 10.2/10.3 need wallet creds)
CURRENT SUBPHASE: 10.2 JazzCash / 10.3 Easypaisa (BLOCKED on sandbox credentials)

Phase 10 Progress:
  10.1 Stripe Integration   [x] Done (card pay end-to-end in PKR; verified)
  10.2 JazzCash Integration [ ] Blocked — needs JazzCash sandbox merchant creds
  10.3 Easypaisa Integration[ ] Blocked — needs Easypaisa sandbox creds (2–5 day lead)
  10.4 Cash on Delivery     [x] Done (config fee + minimum + gating; verified)

Notes (10.1 + 10.4):
  - MIGRATION 20260613052511_cod_fee_and_payment_fields: SystemConfig.codFee Int
    + codMinOrder Int; Order.codFee Decimal. (2FA migration was 20260613044344.)
  - STRIPE (test keys already in .env; VITE_STRIPE_PUBLISHABLE_KEY in
    frontend/.env). payment.service: createPaymentIntent (amount from SERVER-side
    order.total, currency PKR=2-decimal so paisa=total*100; metadata.orderId;
    automatic_payment_methods allow_redirects:never; reuses an existing PI).
    confirmPayment (re-retrieves PI from Stripe -> markOrderPaid: Payment PAID +
    Order PROCESSING + notify; idempotent) — this is the RELIABLE LOCAL PATH since
    webhooks can't reach localhost. handleWebhookEvent (constructEvent w/
    STRIPE_WEBHOOK_SECRET; payment_intent.succeeded/payment_failed) = production
    path. Routes: POST /payments/stripe/create-intent|confirm (auth);
    POST /payments/stripe/webhook is mounted in app.ts with express.raw BEFORE
    express.json (raw body needed for signature). STRIPE_WEBHOOK_SECRET is empty
    locally -> webhook returns 400 until a `stripe listen` secret is set; the
    confirm endpoint covers local dev.
  - Frontend: lib/stripe (loadStripe from VITE key), lib/api/payment.api.
    CheckoutPage WRAPPED in <Elements>; CardElement now lives on the REVIEW step
    (stays mounted at confirm time) w/ dark styling + 4242 test hint. placeOrder:
    STRIPE -> createOrder -> createStripeIntent -> stripe.confirmCardPayment(card)
    -> confirmStripePayment(server verify) -> confirmation. COD/others unchanged.
  - COD (10.4): order.service.createOrder reads SystemConfig — blocks disabled
    methods, enforces codMinOrder (400), adds codFee to total, stores Order.codFee
    (mapOrder returns it). getPublicConfig exposes codFee+codMinOrder; CheckoutPage
    shows the fee row + min-order warning + disables Place Order below min.
    OwnerSystemConfigPage gained COD fee + minimum inputs. Admin marking DELIVERED
    already flips COD payment to PAID (6.2) — no new admin action needed.
  - Verified live (owner-as-customer): checkout review renders the REAL Stripe
    CardElement iframe (gold card icon + Link Autofill) + test hint, Place Order
    Rs 6,799. Backend E2E via pm_card_visa: order -> intent (PKR 679900 paisa) ->
    PI succeeded -> confirm endpoint PAID -> order PROCESSING + payment PAID. COD:
    below-min 6799<10000 -> 400 w/ message; fee 150/min 0 -> order codFee 150,
    total 6949; public config reflects fee/min. ALL TEST ORDERS DELETED, stock
    restored (+2), config reset to 0/0, cart cleared. Console clean.
  - NOTE: Stripe order-first flow means a failed card payment leaves a PENDING
    order (retry would create a new order). Acceptable for now; a "retry payment
    on existing order" UX is a future enhancement.

Phase 8 — COMPLETE (Owner Panel). Phase 9 (AI) deferred — needs OpenAI/Gemini key.

Phase 8 Progress:
  8.1 Owner Dashboard & Financial Stats  [x] Done (8 cards+charts+financials; verified)
  8.2 Owner Analytics & Sales Predictions[x] Done (TF.js forecast+4 charts; verified)
  8.3 User Management & Deletion Approvals[x] Done (admins CRUD + approvals; verified)
  8.4 System Config & Audit Log          [x] Done (config+audit+2FA; verified)

Notes (8.4):
  - MIGRATION 20260613044344_system_config_and_2fa: SystemConfig singleton
    (id="singleton": storeName/supportEmail/maintenanceMode/maintenanceMessage/
    cod|stripe|jazzcash|easypaisaEnabled/paymentMode) + User.twoFactorEnabled
    + User.twoFactorSecret.
  - SECURITY: sanitize() in auth.service AND user.service now strips
    twoFactorSecret too (SafeUser = Omit<User,'password'|'twoFactorSecret'>).
    Verified the secret never appears in any user payload.
  - config.service: getConfig (upsert singleton), updateConfig (audit
    CONFIG_UPDATE), getPublicConfig (storeName/maintenance/paymentMode/enabled
    payments). Routes: GET/PUT /owner/config; PUBLIC GET /config/public.
  - audit.service.listAuditLogs (filters actorId/action/from/to + pagination,
    actor names) + listAuditFilters (distinct actions+actors). GET /owner/audit
    + /owner/audit/filters.
  - 2FA (otplib v12 — PINNED; v13 dropped the `authenticator` export). 
    twofactor.service: setup2FA (gen secret, store, return secret+otpauthUrl),
    enable2FA (verify code -> enable; audit 2FA_ENABLE), disable2FA (verify ->
    clear; 2FA_DISABLE). LOGIN ENFORCED: auth.service.login throws 401
    TWO_FACTOR_REQUIRED{userId} when enabled; verifyTwoFactorLogin completes via
    POST /auth/2fa/verify. completeLogin() shared by both paths. Routes:
    POST /users/me/2fa/setup|enable|disable (auth), POST /auth/2fa/verify (pub).
  - Frontend: lib/api config.api/audit.api/twofactor.api. OwnerSystemConfigPage
    (branding save + payment toggles [live save] + sandbox/live mode +
    maintenance toggle w/ red UI + message). OwnerAuditLogPage (actor/action/
    date filters, paginated table, CSV export). OwnerSettingsPage (profile/pw/
    avatar/activity like admin + REAL 2FA: setup -> QRCodeSVG[qrcode.react]+
    manual key -> code -> enable; disable w/ code). LoginPage handles
    TWO_FACTOR_REQUIRED -> 6-digit step -> verifyTwoFactor. useAuth.finishSession
    shared by login+verifyTwoFactor. MaintenanceBanner in CustomerLayout (reads
    /config/public). CheckoutPage filters payment methods by public config.
  - Verified live (owner): config 3 sections + 5 toggles; maintenance ON ->
    /config/public true -> storefront gold banner renders (screenshot) -> OFF
    restored. Audit log 30 rows (humanized actions incl LOGIN/CONFIG_UPDATE/
    deletions), 2 actors/15 actions filters; action=CONFIG_UPDATE -> exactly 2.
    Owner settings 4 sections; 2FA setup (secret N5..+QR+input) -> enable via UI
    (code 293414) -> Enabled. Enforcement: login -> 401 TWO_FACTOR_REQUIRED ->
    /auth/2fa/verify(TOTP) -> 200 OWNER token, secretLeaked=false. Disabled via
    API -> normal login 200 again. Config back to defaults. Console clean.
  - NOTE: 3 pre-existing HIGH npm advisories are esbuild/vite (dev-only); fixing
    needs a breaking Vite 8 upgrade -> deferred (out of scope). qrcode.react clean.
  - Owner /reports (OW-07) still a placeholder -> Phase 12.

Notes (8.3):
  - Backend: user-management.service (OWNER). listAdmins (search/status,
    productCount). createAdmin -> generates temp password (Indus-XXXX-xxxx9),
    creates pre-verified+active ADMINISTRATOR, emails sendAdminWelcomeEmail
    (best-effort) AND returns tempPassword once (sandbox email is restricted);
    audit ADMIN_CREATE. setAdminStatus (suspend revokes refresh tokens).
    deleteAdmin GUARDED: 409 if admin has products or auditLogs (suggests
    suspend) — never orphans FKs / destroys audit trail; else tx-deletes
    notifications+tokens+otp+user. listDeletionRequests (product preview +
    requester/reviewer names resolved in one query; status pending|all).
  - Routes (owner.routes): GET/POST /owner/admins, PATCH /admins/:id/status,
    DELETE /admins/:id, GET /owner/deletions. approve/reject already existed
    (POST /owner/products/:id/approve-delete | reject-delete, by product id).
  - Frontend: lib/api/user-management.api. OwnerUserManagementPage (tabs
    Administrators|Customers; admin table + Add modal [RHF -> create -> ONE-TIME
    temp-password reveal w/ copy] + suspend/delete modals; Customers tab reuses
    listCustomers -> /admin/customers/:id). OwnerDeletionApprovalsPage (Pending|
    History tabs; request cards w/ product preview+reason+orderItem count;
    approve modal requires typing EXACT product name to enable; reject inline).
  - Verified live (owner): users page renders; create admin (201, temp pw
    Indus-0DDD-Jz5m9, NEW ADMIN LOGS IN ok role ADMINISTRATOR); suspend 200;
    delete-guard 409 (has LOGIN audit); happy-delete 200 (fresh admin no
    history). Deletions: pending card renders; approve modal gating verified
    (disabled -> wrong text disabled -> exact match ENABLED); approve archives
    product (isActive false) + status APPROVED + reviewedBy + pending empties +
    History tab shows it. Console clean. ALL TEST DATA CLEANED (0 admins, 0
    deletion requests; product reactivated) via temp prisma script (removed).

Notes (8.2):
  - TensorFlow.js: installed PURE-JS @tensorflow/tfjs (NOT tfjs-node — avoids
    Windows native build; CPU backend, fine for this size). Smoke-tested: recovers
    y=2x+1. The "install tfjs-node for speed" log is a hint, not an error.
  - forecast.service.forecastSeries(daily, horizon=7): trains y=a*x+b via a real
    tf.train.adam loop (300 iters) on a normalised daily series, projects 7 days.
    HONEST CONFIDENCE: derived from R^2 + data volume; sufficient=false when
    n<14 or nonZeroDays<5 -> confidence floored low. Never a confident number on
    1-2 points. Disposes tensors.
  - analytics.service.getOwnerAnalytics(days 30|90|180): forecast (daily order
    volume) + salesByCategory (units+revenue) + customerAcquisition (weekly
    verified/unverified) + heatmap (weekday×hour order counts) + funnel
    (registered->cart->ordered->delivered, from REAL tracked DB state, NOT
    page-view analytics we don't collect). GET /owner/analytics.
  - Frontend: lib/api/analytics.api; OwnerAnalyticsPage — AI forecast panel
    (TF.js badge, predicted next-7d total, trend arrow, confidence badge,
    insufficient-data warning, actual+dashed-forecast line chart), category
    horizontal bar, acquisition stacked bar (Recharts), custom 7×24 heatmap
    (rgba-gold intensity cells), custom funnel (proportional bars + conv %).
  - Verified live (owner): all 5 sections render; forecast = Low confidence 1%,
    insufficient warning (1 active day), predicted 0 / -100% down (honest);
    category Electronics Rs6,499; funnel 1/0/1/1; heatmap 1 cell Wed ~11:00;
    13 acquisition weeks. TF.js trained w/o error. Console clean; screenshots ok.

Notes (8.1):
  - HONEST FINANCIALS: schema has NO cost-of-goods field, so profit/expenses are
    NOT fabricated. Money is realised from the Payment ledger: PAID=revenue,
    REFUNDED=refund. Reported as gross / refunds / net (all real).
  - Backend: finance.service.getOwnerDashboard(days 7|30|90) — 8 metrics
    (gross/net/refunds/totalOrders/paidOrders/AOV/newCustomers/shipping),
    financialSeries (per-day gross/refunds/net from Payment.createdAt buckets),
    paymentBreakdown (groupBy method, PAID), pendingActions (orders/deletions/
    lowStock/returns), recentActivity (last 10 AuditLog w/ actor name).
    getOwnerFinancials({from,to}) — summary, revenueSeries, paymentMethods
    (orders+revenue), productPerformance (top 10 by realised OrderItem revenue,
    PAID orders). finance.controller + GET /owner/dashboard, /owner/financials.
  - Frontend: lib/api/finance.api; charts/FinancialChart (3-line gross/net/
    refunds) + charts/PaymentDonut (method amounts). OwnerDashboardPage (8 cards
    2 rows + 7/30/90 toggle, financial chart, payment donut, pending-actions
    panel w/ deep links, staff activity feed). OwnerFinancialsPage (date range
    pickers, 4 summary cards, revenue chart, payment-method table, product-
    performance table, client-side CSV export for both tables). Owner nav links
    already existed (OWNER_NAV).
  - Verified live (owner): dashboard 8 cards (gross/net Rs 6,499, 1 paid order,
    AOV 6,499, 1 new customer); financial multi-line chart + COD donut render;
    financials page tables (COD 1/Rs6,499; Mechanical Keyboard 1u/Rs6,499);
    date-range refetch fires (from=2026-05-20 -> 200); past range (Jan 2026) =>
    all zeros; 90d dashboard gross 6,499. Console clean. Screenshots worked this
    session.
  - NOTE: financialSeries buckets revenue by Payment.createdAt (~order date),
    not the date status flipped to PAID — fine for an order-date revenue chart.

Phase 7 — COMPLETE:
  7.6 AI Chatbot Widget deferred to Phase 9 (OpenAI dep).

Phase 7 Progress:
  7.1 Admin Dashboard                    [x] Done (metrics+charts+recent; verified)
  7.2 Product Management UI              [x] Done (table + add/edit form; verified)
  7.3 Customer Management                [x] Done (list + profile + suspend; verified)
  7.4 Inventory Alerts                   [x] Done (alerts+inline edit+CSV; verified)
  7.5 Admin Notifications & Settings     [x] Done (notifs+prefs+settings+activity)

Notes (7.5):
  - Backend: auth.service.login now writes a LOGIN AuditLog (staff only, with
    req.ip) so sign-ins surface in the settings activity log; controller passes
    { ip: req.ip }. audit.service.listActorActivity(actorId, limit<=100).
    admin-settings.controller.getMyActivity -> GET /admin/activity (own logs).
    Profile/password/avatar REUSE existing /users/me* from 4.5 (no new backend).
  - Frontend: AdminNotificationsPage (reuses notification.api: feed + mark-all-
    read; + per-category preference toggles persisted to localStorage
    'indusai_admin_notif_prefs', filters the feed by enabled category — device-
    local, no backend model). AdminSettingsPage (profile form + avatar + password
    via account.api; Recent Activity table via admin-settings.api with humanized
    action labels + LOGIN icon). lib/api/admin-settings.api.
  - Verified live (owner): settings profile prefilled; activity table = 12 rows
    incl. "Signed in" (LOGIN/Session/::1) + "Updated stock"; notifications feed
    (4) + toggle Order Updates off -> feed 4->0 + LS persisted -> on -> 4
    restored; profile save submitted clean (phone restored via API). Console
    clean. NOTE: preview_screenshot still returned stale frames -> verified via
    DOM eval.
  7.6 AI Chatbot Widget (admin view)     [ ] Deferred -> Phase 9 (OpenAI dep)

Notes (7.4):
  - Backend: inventory.service — alert tiers per VARIANT stock: critical<=2,
    low<=5, moderate<=10, else healthy (STOCK_THRESHOLDS + alertLevel()).
    listInventory (default = alert-only stock<=10; level/includeHealthy/search;
    meta.summary critical/low/moderate counts; ordered stock asc).
    updateVariantStock (absolute set; audit STOCK_UPDATE). bulkUpdateStock
    (by SKU, $transaction, dedupe last-wins, returns {updated,notFound[]};
    audit STOCK_BULK_UPDATE). inventory.controller + validation (bulk<=1000).
  - Routes: GET /admin/inventory, PATCH /admin/inventory/variants/:id,
    POST /admin/inventory/bulk.
  - Frontend: lib/api/inventory.api; AdminInventoryPage — clickable summary
    cards + level tabs (All Alerts/Critical/Low/Moderate/All Products) + search;
    table with INLINE stock quick-edit (dirty -> gold save btn, Enter saves) +
    level badges + product link. CSV Import via papaparse (header sku,stock;
    case-insensitive; validates headers + rows) -> bulk endpoint; Template
    download (Papa.unparse current rows). Added papaparse + @types/papaparse.
  - Verified live (owner): list = 29 alerts (summary 7/11/11), ordered stock
    asc; inline edit speaker 0->30 -> save -> drops out of alerts (healthy);
    PATCH + bulk (2 updated, 1 not-found) via API; seed values restored.
    NOTE: preview_screenshot returned stale/blank frames this session — verified
    via DOM eval + backend 200s instead (page DOM confirmed populated).

Notes (7.3):
  - Backend: customer.service (listCustomers: search name/email + status
    active|suspended + pagination; each row gets orderCount + totalSpent via
    order.groupBy _sum.total). getCustomerProfile (addresses + order summaries +
    stats; 404 for non-CUSTOMER). setCustomerStatus (toggles isActive; SUSPEND
    deletes all refreshTokens => forced logout; audit CUSTOMER_SUSPEND/ACTIVATE).
  - Routes: GET /admin/customers, GET /admin/customers/:id, PATCH
    /admin/customers/:id/status ({ isActive }). customer.controller +
    customer.validation.
  - Frontend: lib/api/customer.api; AdminCustomersPage (status tabs + search +
    table: avatar initials, orders, total spent, status), AdminCustomerDetailPage
    (header card, order history table -> /admin/orders/:id, stats, suspend/
    reactivate action, addresses). Customers nav link already in ADMIN/OWNER_NAV.
  - Address model fields are street/city/province/postalCode/fullName/phone
    (NOT line1/state/country) — typed CustomerAddress accordingly.
  - Verified live (owner): list shows seeded customer; detail renders; SUSPEND
    -> badge Suspended + button flips, REACTIVATE -> back to Active (cache
    invalidated both ways). Console clean.

Notes (7.2):
  - Backend: GET /admin/products (listAdminProducts: search/category/status
    [active|inactive|pending] + pagination; returns totalStock, sku, variantCount,
    deletionStatus) + GET /admin/products/:id (full, by id incl. inactive).
    Create/update/toggle/images/request-delete were built in 3.2.
  - Frontend: AdminProductsPage (table: stock color-coded, status, edit/toggle/
    request-delete modal), AdminProductFormPage (RHF scalars + variants state +
    ImageManager). NEW product -> create -> redirect to /edit (images attach to
    an existing id). Existing variants editable not removable (order FK).
  - Added .input utility class in globals.css for admin forms.
  - Verified live: list (20 rows, stock colors), edit form populates + SAVE
    persists (basePrice 6499->6799). Image upload UI not driven in harness
    (Cloudinary upload verified in 3.2).

Notes (7.1):
  - dashboard.service.getAdminDashboard(role, days): metrics (ordersToday,
    revenueToday [OWNER-only, null for ADMIN per RBAC], pendingOrders,
    lowStockCount<=5), salesSeries (per-day buckets, revenue owner-only),
    categoryBreakdown (units/category), topProducts (groupBy qty), recentOrders
    (last 10), pendingDeletions. GET /api/admin/dashboard?days=7|30.
  - Frontend: AdminDashboardPage (4 metric cards; revenue card shows "Owner only"
    lock when null), SalesChart + CategoryDonut (Recharts), recent orders table,
    top products. Charts: components/charts/*.
  - Recharts is heavy -> Vite re-optimizes on first load (full reload); settles.

Phase 6 — COMPLETE:
  6.1 Customer Order History & Tracking  [x] Done (list + timeline, verified)
  6.2 Admin Order Management             [x] Done (list+status update; verified)
  6.3 Returns / Refund Requests          [x] Done (3-step flow; verified)

Notes (6.3):
  - MIGRATION 20260610082022_return_requests: ReturnRequest + ReturnItem models;
    enums ReturnReason / RefundMethod / ReturnStatus. Back-relations on User,
    Order, OrderItem.
  - return.service.createReturn: requires DELIVERED order within 7-day window,
    validates items belong to order + qty, blocks duplicate active return,
    uploads photos to Cloudinary (indusai/returns), notifies ADMIN+OWNER+customer.
    listMyReturns for customer.
  - POST /api/returns is MULTIPART (upload.array('photos',5) THEN validate);
    items sent as JSON string -> zod transform+pipe. GET /returns/me.
  - Frontend ReturnRequestPage (3-step: items -> reason+desc+photos -> refund ->
    confirmation). Order detail "Request Return" -> ?orderId=. Only DELIVERED.
  - Admin return MANAGEMENT (approve/reject/process) NOT built yet — request flow
    + storage + notifications done; admin processing is a later enhancement.

Notes (6.2):
  - MIGRATION 20260610075148_order_tracking_notes: added Order.trackingNumber +
    Order.internalNotes (String?).
  - order.service: mapOrder(order, isAdmin) — admin map adds internalNotes +
    customer {id,name,email,phone}; customer map omits them (privacy). getOrderById
    passes isStaff so ONE endpoint serves both customer + admin detail.
  - listAllOrders (status/payment/search + groupBy status counts);
    updateOrderStatus (tx: status + tracking/notes; RESTORES stock on
    CANCELLED/REFUNDED; payment->PAID on DELIVERED / REFUNDED; notify customer;
    audit ORDER_STATUS_UPDATE).
  - Admin routes: GET /admin/orders, PATCH /admin/orders/:id/status.
  - Frontend: AdminOrdersPage (summary strip + filters + table), AdminOrderDetailPage
    (status updater + tracking + internal notes + customer/delivery panels).
  - Verified live: owner updated order PENDING->PROCESSING, tracking+notes saved,
    customer notification created.

Notes (6.1):
  - Backend: GET /orders (listOrders: status filter + pagination, lightweight
    summaries w/ thumbnails + itemCount). getOrderById already existed.
  - Frontend: OrderHistoryPage (status filter tabs, order cards) + OrderDetailPage
    (vertical tracking timeline PENDING->PROCESSING->SHIPPED->DELIVERED, items,
    delivery, payment, actions). Shared StatusBadge (components/common).
  - Request Return button shows only when DELIVERED (-> 6.3). Invoice download
    is a stub (toast). Both pages under AccountLayout.

Phase 5 — COMPLETE:
  5.1 Cart Store & Cart Drawer           [x] Done (drawer + /cart page, verified)
  5.2 Checkout Flow                      [x] Done (3-step stepper, verified)
  5.3 Order Placement                    [x] Done (createOrder + confirmation, verified)
  5.4 About / FAQ / 404 pages            [x] Done (3 static pages, verified)

Notes (5.4):
  - AboutPage (hero/orbs, mission, useCountUp stats, values, contact),
    FaqPage (search-filtered accordion by category + "still need help" CTA),
    NotFoundPage (404 catch-all within CustomerLayout; opens GlobalSearch).
  - All static/frontend-only. Wired about/faq/* routes; '*' -> NotFoundPage.

Notes (5.3):
  - order.service.createOrder: $transaction (validate stock, create Order+items+
    Payment, DEDUCT variant stock, clear cart) -> then email + notify (customer +
    ADMINISTRATOR). getOrderById (owner-scoped; staff can view any).
  - IMPORTANT: $transaction needs { maxWait:10s, timeout:20s } — Neon network
    latency blows the default 5s interactive-tx timeout (multi-query order).
  - Payment record created with status PENDING (COD + card/wallet); real gateway
    processing is Phase 10. COD is the only fully-working method right now.
  - Routes: POST /orders, GET /orders/:id (authenticated). order numbers
    IND-YYYYMMDD-XXXXXX (unique, retry on collision).
  - Frontend: CheckoutPage Place Order -> createOrder mutation -> clearGuest +
    invalidate cart -> navigate /order-confirmation/:id. OrderConfirmationPage
    (C-07): framer confetti + drawn checkmark, order #, ETA(+5d), items, total.
  - Verified live: full UI flow places order IND-..., stock 5->3, cart cleared,
    confirmation renders; + API test (stock deduction, empty-cart 400).

Notes (5.2):
  - CheckoutPage (/checkout): 3-step stepper (Delivery/Payment/Review). Step 1
    address radio cards + AddressForm (extracted to components/account/AddressForm,
    shared with AddressesPage) + delivery method (Standard=computeShipping,
    Express=Rs500). Step 2: COD/STRIPE/JAZZCASH/EASYPAISA selection + method
    fields (card/wallet are VISUAL only; real processing = Phase 10). Step 3:
    review w/ edit links + terms + Place Order.
  - Place Order currently toasts a placeholder — createOrder endpoint + order
    confirmation page are Subphase 5.3.
  - Sidebar order summary recomputes total = subtotal + deliveryFee.
  - Verified live (owner): full 3-step flow with seeded cart item + address.

Notes (5.1):
  - CartDrawer (components/cart) rendered once in CustomerLayout; opens via
    navbar cart button (cartStore.isOpen) and auto-opens after add-to-cart.
  - CartPage (/cart): items list + OrderSummary (shipping free >= threshold,
    else STANDARD_SHIPPING=200; free-shipping progress bar). CartLineItem shared
    by drawer + page. computeShipping/OrderSummary reused in checkout (5.2).
  - cart store/useCart were built in 4.3 (guest localStorage + server merge).

Phase 4 — COMPLETE:
  4.1 Homepage                           [x] Done (8 sections, live data, verified)
  4.2 Product Listing & Filters          [x] Done (URL-synced filters; verified)
  4.3 Product Detail Page                [x] Done (gallery/variants/cart/reviews)
  4.4 Search & AI Search                 [x] Done (overlay; basic search; verified)
  4.5 Wishlist, Profile & Account Pages  [x] Done (account API + 4 pages verified)

Notes (4.5):
  - Backend added: PATCH /users/me, /users/me/password, POST /users/me/avatar
    (Cloudinary); /addresses CRUD + /:id/default; /notifications list/unread-
    count/:id/read/read-all. All authenticated. account.validation schemas.
  - Frontend: AccountLayout (sidebar) wraps account/* routes; WishlistPage,
    ProfilePage (avatar upload + profile + password), AddressesPage (inline
    add/edit form, default badge), NotificationsPage (type icons, mark read).
  - Address delete blocked if linked to an order (FK-safe).
  - TESTING NOTE: preview_fill + RHF submit is flaky under Vite dep re-optimization
    (full reloads interrupt). Verified account mutations via direct API test
    instead; pages render fine. Real keystrokes are unaffected.
  - cart store/useCart from 4.3; CartDrawer UI is Phase 5.1.

Notes (4.4):
  - GlobalSearch overlay (components/search) rendered once in CustomerLayout;
    opened via navbar search button or Cmd/Ctrl+K (uiStore.searchOpen).
  - Debounced (300ms) live product results + "Search for q" + recent searches
    (localStorage) + category shortcuts; arrow/enter/esc keyboard nav.
  - Enter / "Search for" -> /search?q= (ProductListingPage from 4.2 renders it).
  - AI semantic search is Phase 9 (OpenAI); this UX upgrades automatically then.

Notes (4.3):
  - Cart store landed EARLY here (needed for add-to-cart): stores/cartStore
    (guest cart in localStorage) + hooks/useCart (unified guest/server). Phase
    5.1 adds the CartDrawer UI + fly-to-cart animation on top.
  - Merge-on-login wired in useAuth.login (POST /cart/merge then clearGuest).
  - Navbar cart badge = useCart().count. Backend setCartItem sets ABSOLUTE qty,
    so useCart.addToCart computes existing+selected before calling.
  - Detail page: ProductGallery (zoom+lightbox), VariantSelector (color/size,
    disables unavailable sizes), PurchasePanel, ProductTabs (Desc/Specs/Reviews/
    Similar), ProductReviews (histogram+write form), StickyCartBar (IO-triggered).
  - DB: connectDatabase now RETRIES (5x/3s) — Neon free tier auto-suspends and
    cold-start can exceed a single attempt. Deep suspend can take >1min to wake.
  4.4 Search & AI Search                 [ ] Not Started
  4.5 Wishlist, Profile & Account Pages  [ ] Not Started

Notes (4.1):
  - React Query data layer: lib/api/product.api + hooks/useProducts
    (useCategories/useFeaturedProducts/useFlashDeals/useNewArrivals).
  - Reusable ProductCard (components/product) — hover crossfade, Sale/LowStock/
    SoldOut badges, wishlist quick-add (authed -> API, guest -> toast+login).
  - Shared: StarRating, PriceDisplay (PKR), SkeletonCard; hooks useCountdown,
    useCountUp (IntersectionObserver). Category imagery via picsum seed (no
    category.image in DB yet).
  - Home sections in components/home/*. All handle loading/error/empty.

Notes (4.2):
  - ProductListingPage serves /shop/:category AND /search (?q=) — C-02 & C-03.
  - Filters live in URL (shareable): minPrice/maxPrice/size/color/brand/rating/
    inStock/sortBy. useInfiniteProducts (load-more) + useProductFacets (derives
    brands/sizes/colors/price range from a category-wide fetch, limit 100).
  - ProductCard gained layout='grid'|'list'; cssColor moved to lib/utils.
  - Dual-handle price slider = two overlaid range inputs; thumb CSS in globals
    (.range-input). React Query hashes query keys, so new filter objects per
    render don't refetch.

Phase 3 — COMPLETE:
  3.1 Product API (Public)               [x] Done (6 endpoints, e2e verified)
  3.2 Product API (Admin/Owner CRUD)     [x] Done (Cloudinary live; 12 checks pass)
  3.3 Review System                      [x] Done (purchase-gated; 10 checks pass)
  3.4 Wishlist & Cart Backend            [x] Done (stock-validated; merge; 9 checks)

Notes (3.4):
  - Cart POST sets ABSOLUTE quantity (0 removes); validates active + variant + stock.
  - variantId nullable -> use findFirst (Postgres treats NULLs as distinct, so
    findUnique/upsert on composite-with-null is unreliable).
  - /cart/merge sums guest+server quantities capped at stock (skips invalid).
  - Wishlist add is idempotent (upsert). All cart/wishlist routes authenticated.
  - Guest cart store + merge-on-login wiring is frontend (Phase 5.1).

Notes (3.3):
  - Review requires a DELIVERED order containing the product; 1 per user/product
    (DB unique userId_productId). ADMIN/OWNER can moderate-delete any (audited).
  - GET /products/:id/reviews is by product UUID (detail page is by slug).
  - getReviewStatsMap + emptyReviewStats exported from product.service for reuse.

Notes (3.2):
  - Cloudinary LIVE (cloud ddvgzqsjc); upload_stream -> 800x800 WebP, auto quality.
  - Image upload via multer memoryStorage (5MB/5 files); first image = main.
  - Update does NOT delete variants (order FK refs); updates by id / creates new.
  - Deletion = soft (isActive=false) on Owner approve, preserves order history.
  - audit.service.writeAuditLog + notification.service (notifyUser/notifyRole)
    are shared helpers reused in later phases.
  - config/cloudinary.ts added here (was deferred from 1.3).

Notes (3.1):
  - Decimal -> number serialization in product.service (frontend expects numbers).
  - reviewStats computed via groupBy (avg/count/histogram[5]); empty = zeros.
  - 'rating' sort + flash-deals (comparePrice>basePrice) done in-memory on the
    page/set (Prisma can't compare two columns / sort by relation aggregate).
  - Route order: /products/featured & /flash-deals BEFORE /:slug.
  - docs/API.md created (auth + products/categories).

Phase 2 — COMPLETE:
  2.1 Prisma Schema & DB Setup           [x] Done (Neon migrated + seeded)
  2.2 Auth Service & Utilities           [x] Done (Resend email; console fallback)
  2.3 Auth API Endpoints                 [x] Done (8 endpoints, e2e verified)
  2.4 Frontend Auth Stores & API Layer   [x] Done (axios refresh+retry, store, hook)
  2.5 Auth UI Pages                      [x] Done (6 pages; full flow verified live)

Notes (Phase 2):
  - Resend SANDBOX only delivers to account owner (alibift000006@gmail.com).
    Verify a domain at resend.com/domains for prod to email any recipient.
  - Refresh token in httpOnly cookie 'indusai_rt' (path /api/auth); access
    token returned in body for the frontend to hold in memory.
  - Email sends are resilient (log on failure, never fail the auth operation).
  - reset-password is email+OTP based (not userId) so forgot-flow stays private.
  - initAuth is a single-flight singleton: refresh ROTATES the cookie, so the
    StrictMode double-invoke would self-logout without it. Don't remove.
  - PREVIEW_BYPASS removed — guards enforce auth/role; guards show a loader
    while isInitializing (silent refresh) to avoid bouncing logged-in users.
  - Seeded owner: owner@indusai.pk / Owner@IndusAI2026 (dev).

Phase 1 — COMPLETE:
  1.1 Repository & Monorepo Setup        [x] Done
  1.2 Frontend Scaffold & Design System  [x] Done
  1.3 Backend Scaffold & Configuration   [x] Done
  1.4 Shared Layout & Routing Shell      [x] Done

Notes:
  - config/database.ts deferred to Phase 2.1 (needs Prisma schema/generate).
  - config/cloudinary.ts deferred to Phase 3 (first use).
  - bcrypt -> bcryptjs, multer 1.x -> 2.x, nodemailer -> 8.x (security; 0 vulns).
  - 1.4: 47 routes via a registry + PlaceholderPage (not 47 stub files); real
    pages slot into router/index.tsx per phase, add React.lazy when heavy.
  - TEMP: router/guards.tsx PREVIEW_BYPASS=true so protected shells are
    browsable pre-auth. Phase 2.5 MUST set it false / remove it.
  - ACTION (you): grab Neon DATABASE_URL + SendGrid before 2.1/2.2.

Phase Status:
  Phase 1: Foundation            [~] In Progress
  Phase 2: Database & Auth       [ ] Not Started
  Phase 3: Product System        [ ] Not Started
  Phase 4: Customer UI           [ ] Not Started
  Phase 5: Cart & Checkout       [ ] Not Started
  Phase 6: Order Management      [ ] Not Started
  Phase 7: Admin Panel           [ ] Not Started
  Phase 8: Owner Panel           [ ] Not Started
  Phase 9: AI Features           [ ] Not Started
  Phase 10: Payments             [ ] Not Started
  Phase 11: Notifications        [ ] Not Started
  Phase 12: Reports & Export     [ ] Not Started
  Phase 13: Testing & QA         [ ] Not Started
  Phase 14: Deployment           [ ] Not Started
```

---

## 8. Commands Reference

```bash
# Root level
npm run dev          # Start both frontend and backend
npm run build        # Build both for production
npm run lint         # ESLint across monorepo

# Frontend (from /frontend)
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build

# Backend (from /backend)
npm run dev          # ts-node-dev with hot reload (port 3000)
npm run build        # Compile TypeScript to /dist
npm run start        # Run compiled production build

# Database (from /backend)
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed development data
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:reset     # Reset and reseed (DEVELOPMENT ONLY)
```

---

## 9. Important Notes for Claude Code

```
1. ALWAYS read this file at the start of a new session before writing any code.

2. ALWAYS check which phase/subphase is currently active (Section 7).
   Only implement what is in the current subphase.

3. NEVER skip ahead to future phases even if the task seems simple.
   Phases are ordered by dependency — skipping causes breaking issues.

4. ALWAYS update the phase tracking in Section 7 when a subphase completes.

5. NEVER hardcode environment variables. Always use the config/env.ts pattern.

6. ALWAYS write TypeScript. Never write plain JavaScript files (.js).

7. ALWAYS handle the three UI states: loading, error, empty.
   A component that shows nothing while loading is an incomplete component.

8. When adding a new API endpoint, always:
   a. Define the Zod validation schema first
   b. Add the route to routes/
   c. Add the controller function
   d. Add the business logic to services/
   e. Update docs/API.md

9. When unsure about a design decision, refer to DESIGN_STRATEGY.md
   in the docs/ folder.

10. Run `npm run lint` before marking any subphase as complete.
```

---

## 10. Git Conventions

```
Branch naming:
  feature/phase-X-subphase-Y-description
  fix/short-description
  chore/description

Commit message format:
  feat(scope): short description
  fix(scope): short description
  chore(scope): short description
  docs(scope): short description

Examples:
  feat(auth): implement JWT login endpoint
  feat(product): add product listing page with filters
  fix(cart): resolve quantity update race condition
  chore(db): add seed data for development
  docs(api): document payment endpoints
```

---

*CLAUDE.md — IndusAI Technology E-Commerce Platform*
*Keep this file updated throughout development.*
