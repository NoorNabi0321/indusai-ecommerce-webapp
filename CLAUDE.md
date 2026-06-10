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
CURRENT PHASE: Phase 7 — Admin Panel
CURRENT SUBPHASE: 7.1 — Admin Dashboard

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
