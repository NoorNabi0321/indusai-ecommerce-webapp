# IMPLEMENTATION_PLAN.md — IndusAI Technology E-Commerce Platform
## Complete Phase-by-Phase Technical Development Plan

> Hand this file to Claude Code along with CLAUDE.md at the start of each session.
> Tell Claude Code: "We are on Phase X, Subphase Y. Implement it now."

---

## Plan Overview

```
Total Phases:     14
Total Subphases:  58
Estimated Pages:  47 (per design strategy)
Stack:            React + Node.js + TypeScript + PostgreSQL

Phase  1 — Project Foundation          (4 subphases)
Phase  2 — Database & Auth Backend     (5 subphases)
Phase  3 — Product System Backend      (4 subphases)
Phase  4 — Core Customer UI            (5 subphases)
Phase  5 — Cart & Checkout             (4 subphases)
Phase  6 — Order Management            (4 subphases)
Phase  7 — Admin Panel                 (6 subphases)
Phase  8 — Owner Panel                 (4 subphases)
Phase  9 — AI Features                 (5 subphases)
Phase 10 — Payment Integration         (4 subphases)
Phase 11 — Notifications System        (3 subphases)
Phase 12 — Reports & Export            (3 subphases)
Phase 13 — Testing & Quality Assurance (4 subphases)
Phase 14 — Deployment & Go-Live        (3 subphases)
```

---

## PHASE 1 — Project Foundation
**Goal:** Set up the entire project skeleton, tooling, design system, and shared infrastructure.
**No business logic in this phase — structure only.**

---

### Subphase 1.1 — Repository & Monorepo Setup

**What to create:**
```
indusai-ecommerce/
├── CLAUDE.md
├── IMPLEMENTATION_PLAN.md
├── .gitignore                  ← node_modules, .env, dist, .DS_Store
├── .env.example                ← Template with all required keys (no values)
├── README.md                   ← Project overview + setup instructions
├── package.json                ← Root package with workspaces
├── frontend/
│   └── (empty for now — scaffolded in 1.2)
└── backend/
    └── (empty for now — scaffolded in 1.3)
```

**Tasks:**
1. Initialise root `package.json` with npm workspaces
2. Create `.gitignore` covering both frontend and backend patterns
3. Create `.env.example` listing ALL required environment variables:
   ```
   # Database
   DATABASE_URL=

   # JWT
   JWT_ACCESS_SECRET=
   JWT_REFRESH_SECRET=
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # SendGrid
   SENDGRID_API_KEY=
   SENDGRID_FROM_EMAIL=

   # Twilio (optional)
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_VERIFY_SERVICE_SID=

   # Stripe
   STRIPE_SECRET_KEY=
   STRIPE_PUBLISHABLE_KEY=
   STRIPE_WEBHOOK_SECRET=

   # JazzCash
   JAZZCASH_MERCHANT_ID=
   JAZZCASH_PASSWORD=
   JAZZCASH_INTEGRITY_SALT=
   JAZZCASH_SANDBOX_URL=

   # Easypaisa
   EASYPAISA_STORE_ID=
   EASYPAISA_HASH_KEY=
   EASYPAISA_SANDBOX_URL=

   # OpenAI
   OPENAI_API_KEY=

   # Sentry
   SENTRY_DSN_BACKEND=
   SENTRY_DSN_FRONTEND=

   # App
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```
4. Write `README.md` with setup steps
5. Initialise git repository, make first commit

**Done when:** Clean repo with proper structure, .env.example complete, git initialised.

---

### Subphase 1.2 — Frontend Scaffold & Design System

**What to create:**
```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   └── globals.css         ← CSS variables + Tailwind directives
    ├── lib/
    │   ├── utils.ts            ← cn() helper, formatPrice, formatDate
    │   └── constants.ts        ← App-wide constants
    ├── types/
    │   ├── api.types.ts        ← ApiResponse<T>, PaginatedResponse<T>
    │   ├── user.types.ts
    │   ├── product.types.ts
    │   └── order.types.ts
    └── components/
        └── ui/                 ← Shadcn components installed here
```

**Tasks:**
1. Scaffold Vite + React + TypeScript with `npm create vite@latest`
2. Install and configure Tailwind CSS
3. Install Shadcn/ui and initialise with dark theme base
4. Add Shadcn components: button, card, dialog, sheet, toast, input, label,
   select, badge, separator, skeleton, dropdown-menu, avatar, tabs, progress,
   scroll-area, tooltip
5. Configure `tailwind.config.ts` with full design system tokens:
   - Custom colours: bg (base/surface/elevated/overlay), gold (dim/base/bright/glow)
   - Font families: Sora (display), Inter (ui)
   - Custom border radius values
6. Write `globals.css`:
   - CSS custom properties for design tokens
   - Dark mode as default (class="dark" on html element)
   - Tailwind base, components, utilities
   - Glass effect utility class
7. Add Google Fonts import: Sora + Inter
8. Define all TypeScript types in `types/` directory
9. Write `lib/utils.ts`:
   - `cn()` — class merging helper
   - `formatPrice(amount: number)` — PKR formatting
   - `formatDate(date: Date | string)` — display dates
   - `truncate(str: string, max: number)` — text truncation
10. Install and configure Framer Motion
11. Install React Router v6

**Done when:** `npm run dev` shows a blank dark page, Tailwind works, all types defined.

---

### Subphase 1.3 — Backend Scaffold & Configuration

**What to create:**
```
backend/
├── package.json
├── tsconfig.json
├── .env                        ← Actual env file (gitignored)
└── src/
    ├── server.ts               ← HTTP server entry point
    ├── app.ts                  ← Express app, middleware chain
    ├── config/
    │   ├── env.ts              ← Zod env validation
    │   ├── database.ts         ← Prisma client singleton
    │   └── cloudinary.ts       ← Cloudinary config
    └── utils/
        ├── logger.ts           ← Winston logger
        ├── AppError.ts         ← Custom error class
        └── asyncHandler.ts     ← Async route wrapper
```

**Tasks:**
1. Initialise Node.js + TypeScript project
2. Install core dependencies:
   ```
   express, cors, helmet, morgan, compression,
   express-rate-limit, cookie-parser, dotenv,
   zod, @prisma/client, prisma,
   bcrypt, jsonwebtoken, uuid,
   winston, @sentry/node,
   nodemailer, @sendgrid/mail,
   cloudinary, multer,
   stripe, axios
   ```
3. Install dev dependencies:
   ```
   typescript, ts-node-dev, @types/node, @types/express,
   @types/bcrypt, @types/jsonwebtoken, @types/cors,
   @types/cookie-parser, @types/multer
   ```
4. Write `config/env.ts` — Zod schema validates all env vars, exported as `env` object
5. Write `config/database.ts` — Prisma client singleton with graceful shutdown
6. Write `utils/logger.ts` — Winston with console + file transports
7. Write `utils/AppError.ts` — custom error class with statusCode and errorCode
8. Write `utils/asyncHandler.ts` — wraps async controllers to catch rejections
9. Write `app.ts`:
   - Helmet security headers
   - CORS (only allow FRONTEND_URL)
   - Morgan request logging
   - JSON body parser (limit 10mb)
   - Cookie parser
   - Global rate limiter (100 req/15min per IP)
   - Route prefix `/api`
   - 404 handler
   - Global error handler middleware
10. Write `server.ts` — starts HTTP server, handles uncaught exceptions
11. Configure Sentry error tracking
12. Test: `npm run dev` starts server on port 3000, `/api/health` returns 200

**Done when:** Server starts cleanly, env validation works, health check passes.

---

### Subphase 1.4 — Shared Layout Components & Routing Shell

**What to create:**
```
frontend/src/
├── router/
│   └── index.tsx               ← All 47 routes defined (pages as lazy imports)
├── components/
│   └── layout/
│       ├── CustomerLayout.tsx  ← Navbar + Footer wrapper
│       ├── AdminLayout.tsx     ← Sidebar + Topbar wrapper
│       ├── OwnerLayout.tsx     ← Same as Admin with extra nav items
│       ├── AuthLayout.tsx      ← Split-screen wrapper
│       ├── Navbar.tsx          ← Customer navbar
│       ├── Footer.tsx          ← Customer footer
│       ├── AdminSidebar.tsx    ← Admin navigation sidebar
│       └── OwnerSidebar.tsx    ← Owner navigation sidebar
└── pages/
    ├── auth/                   ← Placeholder pages (skeleton only)
    ├── customer/               ← Placeholder pages
    ├── admin/                  ← Placeholder pages
    └── owner/                  ← Placeholder pages
```

**Tasks:**
1. Create router with React Router v6:
   - All 47 routes defined with lazy loading (`React.lazy`)
   - Route guards:
     `<ProtectedRoute>` — requires auth
     `<RoleRoute role="admin">` — requires specific role
     `<GuestRoute>` — redirects if already logged in
   - Wrap routes in `<Suspense>` with skeleton fallback
2. Build `AuthLayout.tsx` — split screen, gradient mesh background animated with CSS
3. Build `CustomerLayout.tsx` — Navbar + `<Outlet>` + Footer
4. Build `Navbar.tsx`:
   - Logo (text-based for now, image in Phase 4)
   - Desktop: search bar placeholder, wishlist icon, cart icon (count=0), auth buttons
   - Mobile: hamburger → full-screen drawer with navigation links
   - Sticky with glass-blur effect on scroll (useScroll Framer Motion)
5. Build `Footer.tsx` — 3-column layout, copyright bar
6. Build `AdminLayout.tsx` — sidebar + top bar + `<Outlet>`
7. Build `AdminSidebar.tsx` — navigation items for admin role
8. Build `OwnerSidebar.tsx` — admin items + owner-exclusive items
9. Create all 47 placeholder page files (each just renders "Page Name — Coming Soon")
10. Verify all routes navigate without errors

**Done when:** All 47 routes accessible, layouts render correctly, no broken navigation.

---

## PHASE 2 — Database Schema & Authentication
**Goal:** Complete database schema, all auth endpoints, JWT system, and auth UI pages.

---

### Subphase 2.1 — Prisma Schema & Database Setup

**What to create/modify:**
```
backend/prisma/
├── schema.prisma               ← Complete database schema
└── migrations/                 ← Auto-generated by Prisma
```

**Tasks:**
1. Write complete `schema.prisma` with all models:

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  phone           String?   @unique
  name            String
  password        String
  role            UserRole  @default(CUSTOMER)
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  avatar          String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  addresses       Address[]
  orders          Order[]
  reviews         Review[]
  wishlist        WishlistItem[]
  cartItems       CartItem[]
  notifications   Notification[]
  refreshTokens   RefreshToken[]
  otpRecords      OTPRecord[]
  auditLogs       AuditLog[]    @relation("ActorLogs")
}

enum UserRole { CUSTOMER ADMINISTRATOR OWNER }

model Product {
  id              String    @id @default(uuid())
  name            String
  slug            String    @unique
  description     String
  categoryId      String
  brand           String?
  tags            String[]
  isActive        Boolean   @default(true)
  isFeatured      Boolean   @default(false)
  basePrice       Decimal   @db.Decimal(10,2)
  comparePrice    Decimal?  @db.Decimal(10,2)
  createdById     String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  category        Category  @relation(fields: [categoryId], references: [id])
  variants        ProductVariant[]
  images          ProductImage[]
  reviews         Review[]
  orderItems      OrderItem[]
  wishlist        WishlistItem[]
  cartItems       CartItem[]
  deletionRequest DeletionRequest?
}

model ProductVariant {
  id        String   @id @default(uuid())
  productId String
  size      String?
  color     String?
  sku       String   @unique
  stock     Int      @default(0)
  price     Decimal? @db.Decimal(10,2)
  product   Product  @relation(fields: [productId], references: [id])
  cartItems CartItem[]
  orderItems OrderItem[]
}

model ProductImage {
  id         String  @id @default(uuid())
  productId  String
  url        String
  publicId   String
  isMain     Boolean @default(false)
  order      Int     @default(0)
  product    Product @relation(fields: [productId], references: [id])
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
}

model Order {
  id              String        @id @default(uuid())
  orderNumber     String        @unique
  userId          String
  status          OrderStatus   @default(PENDING)
  subtotal        Decimal       @db.Decimal(10,2)
  shippingCost    Decimal       @db.Decimal(10,2) @default(0)
  discount        Decimal       @db.Decimal(10,2) @default(0)
  total           Decimal       @db.Decimal(10,2)
  addressId       String
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation(fields: [userId], references: [id])
  address         Address       @relation(fields: [addressId], references: [id])
  items           OrderItem[]
  payment         Payment?
}

enum OrderStatus { PENDING PROCESSING SHIPPED DELIVERED CANCELLED REFUNDED }

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  productId   String
  variantId   String?
  quantity    Int
  price       Decimal  @db.Decimal(10,2)
  order       Order    @relation(fields: [orderId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
}

model Address {
  id          String  @id @default(uuid())
  userId      String
  label       String?
  fullName    String
  phone       String
  street      String
  city        String
  province    String
  postalCode  String
  isDefault   Boolean @default(false)
  user        User    @relation(fields: [userId], references: [id])
  orders      Order[]
}

model Payment {
  id              String        @id @default(uuid())
  orderId         String        @unique
  method          PaymentMethod
  status          PaymentStatus @default(PENDING)
  amount          Decimal       @db.Decimal(10,2)
  transactionId   String?
  gatewayResponse Json?
  createdAt       DateTime      @default(now())
  order           Order         @relation(fields: [orderId], references: [id])
}

enum PaymentMethod { STRIPE JAZZCASH EASYPAISA COD }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }

model Review {
  id        String   @id @default(uuid())
  userId    String
  productId String
  rating    Int
  title     String?
  body      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
}

model WishlistItem {
  id        String  @id @default(uuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  user      User    @relation(fields: [userId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
}

model CartItem {
  id        String   @id @default(uuid())
  userId    String
  productId String
  variantId String?
  quantity  Int      @default(1)
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  product   Product  @relation(fields: [productId], references: [id])
  variant   ProductVariant? @relation(fields: [variantId], references: [id])
  @@unique([userId, productId, variantId])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  link      String?
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id])
}

enum NotificationType { ORDER_UPDATE PROMOTION ACCOUNT SYSTEM }

model DeletionRequest {
  id          String                @id @default(uuid())
  productId   String                @unique
  requestedBy String
  reason      String
  status      DeletionRequestStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  createdAt   DateTime              @default(now())
  product     Product               @relation(fields: [productId], references: [id])
}

enum DeletionRequestStatus { PENDING APPROVED REJECTED }

model OTPRecord {
  id        String   @id @default(uuid())
  userId    String
  code      String
  type      OTPType
  expiresAt DateTime
  isUsed    Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

enum OTPType { EMAIL_VERIFY PASSWORD_RESET TWO_FACTOR }

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  actorRole  UserRole
  action     String
  target     String?
  targetId   String?
  ipAddress  String?
  createdAt  DateTime @default(now())
  actor      User     @relation("ActorLogs", fields: [actorId], references: [id])
}
```

2. Run `npx prisma migrate dev --name init`
3. Run `npx prisma generate`
4. Write `prisma/seed.ts`:
   - Seed Owner account (use env var for password)
   - Seed 4 categories (Shirts, Shoes, Jewellery, Electronics)
   - Seed 5 sample products per category with variants
5. Run `npm run db:seed` and verify in Prisma Studio

**Done when:** Database has all tables, seed runs successfully.

---

### Subphase 2.2 — Auth Service & Utilities

**What to create:**
```
backend/src/
├── utils/
│   ├── jwt.ts          ← Token generation + verification
│   ├── otp.ts          ← OTP generation, storage, verification
│   ├── email.ts        ← SendGrid email wrapper functions
│   └── hash.ts         ← bcrypt helpers
└── services/
    └── auth.service.ts ← All auth business logic
```

**Tasks:**
1. Write `utils/jwt.ts`:
   - `generateAccessToken(userId, role)` → 15min JWT
   - `generateRefreshToken(userId)` → 7d JWT
   - `verifyAccessToken(token)` → decoded payload or throws
   - `verifyRefreshToken(token)` → decoded payload or throws
2. Write `utils/hash.ts`:
   - `hashPassword(plain)` → bcrypt hash, saltRounds=12
   - `comparePassword(plain, hash)` → boolean
3. Write `utils/otp.ts`:
   - `generateOTP()` → 6-digit numeric string
   - `createOTPRecord(userId, type)` → saves to DB, expires in 10min
   - `verifyOTPRecord(userId, code, type)` → validates + marks used
4. Write `utils/email.ts` (SendGrid wrapper):
   - `sendVerificationEmail(to, name, otp)`
   - `sendPasswordResetEmail(to, name, otp)`
   - `sendOrderConfirmationEmail(to, name, order)`
   - `sendAdminWelcomeEmail(to, name, tempPassword)`
   - Email templates as HTML strings (branded with IndusAI colours)
5. Write `services/auth.service.ts`:
   - `registerCustomer(data)` — create user, send OTP email
   - `verifyEmail(userId, otp)` — verify OTP, activate account
   - `login(email, password)` — validate credentials, return tokens
   - `refreshTokens(refreshToken)` — validate refresh, issue new pair
   - `logout(refreshToken)` — delete refresh token from DB
   - `forgotPassword(email)` — generate OTP, send reset email
   - `resetPassword(userId, otp, newPassword)` — verify OTP, update password

**Done when:** All auth service functions work, emails send correctly in test.

---

### Subphase 2.3 — Auth API Endpoints

**What to create:**
```
backend/src/
├── middleware/
│   ├── auth.middleware.ts     ← Verify JWT, attach user to req
│   ├── role.middleware.ts     ← Check user role against required roles
│   └── validate.middleware.ts ← Zod request validation wrapper
├── controllers/
│   └── auth.controller.ts
└── routes/
    └── auth.routes.ts
```

**Endpoints to implement:**
```
POST   /api/auth/register          — Customer registration
POST   /api/auth/verify-email      — Email OTP verification
POST   /api/auth/login             — Login (customer + admin + owner)
POST   /api/auth/logout            — Logout (delete refresh token)
POST   /api/auth/refresh           — Refresh access token
POST   /api/auth/forgot-password   — Request password reset OTP
POST   /api/auth/reset-password    — Reset with OTP
GET    /api/auth/me                — Get current user (protected)
```

**Tasks:**
1. Write `validate.middleware.ts`:
   - `validate(schema)` middleware factory
   - Validates `req.body`, `req.params`, `req.query`
   - Returns 422 with Zod error details on failure
2. Write `auth.middleware.ts`:
   - `authenticate` — extracts JWT from httpOnly cookie or Authorization header
   - Attaches `req.user = { id, role }` on success
   - Returns 401 if missing/invalid token
3. Write `role.middleware.ts`:
   - `requireRole(...roles)` — checks `req.user.role` against allowed roles
   - Returns 403 if role not permitted
4. Define Zod schemas for each request
5. Write auth controller functions (thin — delegate to auth service)
6. Wire up routes with middleware chain:
   `router.post('/login', validate(loginSchema), authController.login)`
7. Set refresh token as httpOnly cookie (secure in production)
8. Rate limit auth endpoints: 5 requests per 15 minutes per IP
9. Apply stricter rate limit to admin-login: 3 attempts per 15 min

**Done when:** All 8 auth endpoints working, tested with Postman/HTTP client.

---

### Subphase 2.4 — Frontend Auth Stores & API Layer

**What to create:**
```
frontend/src/
├── lib/
│   └── axios.ts            ← Axios instance with interceptors
├── stores/
│   └── authStore.ts        ← Zustand auth state
└── hooks/
    └── useAuth.ts          ← Auth hook for components
```

**Tasks:**
1. Write `lib/axios.ts`:
   - Base URL from `VITE_API_URL` env var
   - Request interceptor: attach access token from store
   - Response interceptor: on 401, attempt token refresh, retry request
   - On refresh failure: clear auth store, redirect to login
2. Write `stores/authStore.ts` (Zustand):
   - State: `user`, `accessToken`, `isLoading`, `isAuthenticated`
   - Actions: `setUser`, `setToken`, `logout`, `initialize`
3. Write `hooks/useAuth.ts`:
   - Exposes auth state and actions
   - `login(email, password)` — calls API, updates store
   - `logout()` — calls API, clears store, redirects
   - `register(data)` — calls API
4. Write React Query hooks for auth:
   - `useCurrentUser()` — fetches `/api/auth/me`

**Done when:** Auth store works, API layer handles token refresh automatically.

---

### Subphase 2.5 — Auth UI Pages

**Pages to build (referencing design strategy):**
- Page A-01: Register
- Page A-02: OTP Verification
- Page A-03: Login (Customer)
- Page A-04: Forgot Password
- Page A-05: Reset Password
- Page A-06: Admin/Owner Login

**Tasks:**
1. Build reusable auth components:
   - `OTPInput.tsx` — 6 individual boxes, auto-advance, paste support
   - `PasswordStrength.tsx` — animated 4-segment bar
   - `AuthFormWrapper.tsx` — glass card container
2. Build all 6 auth pages with full form validation (React Hook Form + Zod)
3. Animated gradient mesh background (CSS keyframes + Framer Motion)
4. Connect all forms to auth store actions
5. Loading states on all submit buttons
6. Error messages from API displayed inline
7. Navigation between auth pages (login ↔ register ↔ forgot password)
8. Route guards: `<GuestRoute>` redirects authenticated users away from auth pages
9. `<ProtectedRoute>` redirects unauthenticated users to login

**Done when:** Full auth flow works end-to-end — register → verify email → login → logout.

---

## PHASE 3 — Product System
**Goal:** Complete product CRUD backend + Cloudinary image upload.

---

### Subphase 3.1 — Product API (Public Endpoints)

**Endpoints:**
```
GET    /api/products                    — List with filters/pagination/search
GET    /api/products/:slug              — Single product detail
GET    /api/products/featured           — Featured products
GET    /api/products/flash-deals        — Products on sale
GET    /api/categories                  — All categories
GET    /api/categories/:slug/products   — Products by category
```

**Tasks:**
1. Write `services/product.service.ts`:
   - `getProducts(filters)` — supports: category, minPrice, maxPrice,
     size, color, brand, rating, inStock, search, sortBy, page, limit
   - `getProductBySlug(slug)` — with full relations
   - `getFeaturedProducts(limit)` — featured flag
   - `getFlashDeals(limit)` — comparePrice > basePrice
   - `searchProducts(query)` — basic Prisma full-text search
2. Write controller and routes for above
3. Auto-generate slug from product name on creation (url-slug library)
4. Return nested data: variants, images, category, review stats (avg, count)
5. Pagination on product list (default 20 per page)

**Done when:** Product listing and detail endpoints return correct data.

---

### Subphase 3.2 — Product API (Admin/Owner Protected Endpoints)

**Endpoints:**
```
POST   /api/admin/products             — Create product (Admin+)
PUT    /api/admin/products/:id         — Edit product (Admin+)
PATCH  /api/admin/products/:id/status  — Toggle active/inactive (Admin+)
POST   /api/admin/products/:id/images  — Upload images (Admin+)
DELETE /api/admin/products/:id/images/:imageId — Remove image (Admin+)
POST   /api/admin/products/:id/request-delete  — Request deletion (Admin+)
POST   /api/owner/products/:id/approve-delete  — Approve deletion (Owner)
POST   /api/owner/products/:id/reject-delete   — Reject deletion (Owner)
```

**Tasks:**
1. Write Zod schemas for create/update product (all field validation)
2. Write Cloudinary upload middleware using multer + Cloudinary stream
3. Auto-normalise uploaded images via Cloudinary transformations:
   - Crop to 800×800, format WebP, quality auto
4. Write product admin service functions
5. Implement deletion request workflow:
   - Admin submits reason → creates DeletionRequest record → notifies Owner
   - Owner approves → product soft-deleted (isActive=false, archived)
   - Owner rejects → DeletionRequest status=REJECTED, product stays active
6. Write audit log entry for all admin product actions

**Done when:** Full product CRUD works for admin, deletion workflow tested.

---

### Subphase 3.3 — Review System

**Endpoints:**
```
POST   /api/products/:id/reviews    — Write review (must have purchased)
GET    /api/products/:id/reviews    — Get reviews (paginated)
DELETE /api/reviews/:id             — Delete own review
```

**Tasks:**
1. Validate: user must have a DELIVERED order containing that product
2. One review per user per product (enforced by DB unique constraint)
3. Review stats calculated: avg rating, count per star level
4. Return stats with product detail endpoint
5. Admin can delete any review (moderation)

**Done when:** Reviews can be written, read, and affect product rating stats.

---

### Subphase 3.4 — Wishlist & Cart Backend

**Endpoints:**
```
GET    /api/wishlist                — Get user's wishlist
POST   /api/wishlist/:productId    — Add to wishlist
DELETE /api/wishlist/:productId    — Remove from wishlist

GET    /api/cart                   — Get user's cart
POST   /api/cart                   — Add/update cart item
DELETE /api/cart/:itemId           — Remove cart item
DELETE /api/cart                   — Clear cart
```

**Tasks:**
1. Cart service: handles quantity update if item already exists
2. Cart validates: product/variant is active and in stock
3. Cart returns full product data (for display)
4. Wishlist: toggle pattern (add if not exists, remove if exists)
5. Guest cart: stored in Zustand (not persisted to DB until login)
6. On login: merge guest cart with server cart

**Done when:** Cart and wishlist endpoints all work, merge on login tested.

---

## PHASE 4 — Core Customer UI
**Goal:** Homepage, product listing, product detail, search pages.

---

### Subphase 4.1 — Homepage

**Page: C-01**

**Tasks:**
1. Build `AnimatedHero.tsx` component:
   - Word-by-word text animation with Framer Motion stagger
   - Animated gradient orbs (CSS keyframes, gold + purple + teal)
   - Two CTA buttons with hover states
   - Floating product preview cards with parallax on scroll
2. Build `CategoryStrip.tsx`:
   - 4 category cards with background images
   - CSS clip-path or border-radius reveal on hover
3. Build `FlashDealsSection.tsx`:
   - Countdown timer hook `useCountdown(targetDate)`
   - Bento grid layout for deals
   - Deal badge component
4. Build `AIRecommendationsStrip.tsx`:
   - Horizontal scroll with product cards
   - "Sign in for personalised picks" CTA if not authenticated
5. Build `AnimatedStats.tsx`:
   - `useCountUp(target, duration)` hook with Intersection Observer trigger
6. Build `CategoryBanners.tsx`:
   - 2×2 bento grid with background images
7. Assemble homepage with all sections
8. Smooth scroll between sections

**Done when:** Homepage renders all sections, animations work.

---

### Subphase 4.2 — Product Listing & Filters

**Pages: C-02, C-03**

**Tasks:**
1. Build `FilterSidebar.tsx`:
   - Price range dual-handle slider (`react-range` or custom)
   - Size/colour/brand/rating filters
   - Applied filters as removable chips
   - Mobile: slide-in drawer variant
2. Build `ProductGrid.tsx` with view toggle (grid/list)
3. Build `ProductCard.tsx` (full implementation):
   - Hover: image crossfade (CSS transition on two stacked images)
   - Hover: Quick View button rises from bottom
   - Wishlist toggle button
   - Badge system (New/Sale/Low Stock)
4. Build `SortDropdown.tsx`
5. Build `ProductListingPage.tsx` wiring all above together
6. URL state sync: filters reflected in URL params (shareable links)
7. Loading: skeleton product cards during fetch
8. Empty state: illustrated "no products found" with suggestions
9. React Query for fetching with filter params, infinite scroll

**Done when:** Filtering, sorting, and browsing all work with URL sync.

---

### Subphase 4.3 — Product Detail Page

**Page: C-04**

**Tasks:**
1. Build `ProductGallery.tsx`:
   - Main image with hover zoom (CSS transform within overflow hidden)
   - Thumbnail strip with scroll
   - Lightbox modal for fullscreen view
2. Build `VariantSelector.tsx`:
   - Colour swatches (visual dots)
   - Size pill buttons (disabled state for out-of-stock)
   - Updates selected variant in component state
3. Build `PurchasePanel.tsx`:
   - Quantity selector component
   - Add to Cart button with morphing animation (Framer Motion layoutId)
   - Add to Wishlist button
   - Delivery info display
   - Trust badges row
4. Build `ProductTabs.tsx`:
   - Description / Specifications / Reviews / Similar AI
   - Review list with star histogram
   - Write review form (modal, only for qualifying customers)
5. Build sticky `StickyCartBar.tsx`:
   - Appears after scrolling past purchase panel
   - useScrollY + threshold detection
6. Assemble product detail page
7. Breadcrumb navigation component

**Done when:** Full product detail page with gallery, variants, cart, and reviews.

---

### Subphase 4.4 — Search & AI Search

**Page: C-03 + Global Search**

**Tasks:**
1. Build `GlobalSearch.tsx` overlay:
   - Full-width overlay triggered from navbar
   - Sections: recent searches, suggestions, product results
   - Keyboard navigation (arrow keys, Enter, Escape)
   - Debounced API call (300ms)
2. Implement AI-powered smart search:
   - Backend: `/api/search?q=...` uses OpenAI embedding similarity
   - "Did you mean...?" suggestions
   - Related category shortcuts
3. Search results page with same filter/sort as listing page

**Done when:** Search works both basic and AI-enhanced.

---

### Subphase 4.5 — Wishlist, Profile & Account Pages

**Pages: C-10, C-11, C-12, C-13**

**Tasks:**
1. Build `AccountLayout.tsx` with sidebar navigation:
   - Profile, Orders, Wishlist, Addresses, Notifications
2. Build `WishlistPage.tsx`:
   - Product grid, Move to Cart, Remove actions
3. Build `ProfilePage.tsx`:
   - Avatar upload to Cloudinary
   - Profile form with validation
   - Password change section
4. Build `AddressesPage.tsx`:
   - Address cards, default badge
   - Inline add/edit form with animation
5. Build `NotificationsPage.tsx`:
   - Notification list, read/unread states
   - Mark all read button
   - Preference toggles

**Done when:** All account pages functional and connected to API.

---

## PHASE 5 — Cart & Checkout
**Goal:** Full cart experience, multi-step checkout flow.

---

### Subphase 5.1 — Cart Store & Cart Drawer

**Tasks:**
1. Write `stores/cartStore.ts` (Zustand):
   - State: items array, total, count
   - Actions: add, remove, updateQuantity, clear, mergeWithServer
   - Persist to localStorage (guest cart)
   - Sync to server cart on user authentication
2. Build `CartDrawer.tsx`:
   - Slide in from right (Framer Motion)
   - Glassmorphism background
   - Cart items list with quantity controls
   - Order summary with subtotal
   - Checkout button
   - Empty cart state
3. Wire cart drawer to navbar cart icon
4. Cart count badge on navbar icon (animated on add)
5. "Add to Cart" animation: item flies to cart icon (transform animation)

**Done when:** Cart drawer opens, items add/remove, guest cart persists.

---

### Subphase 5.2 — Checkout Flow

**Pages: C-06**

**Tasks:**
1. Build `CheckoutStepper.tsx` — visual 3-step progress indicator
2. Build `Step1Delivery.tsx`:
   - Display saved addresses as selectable radio cards
   - "Add New Address" expandable form
   - Delivery type selector (Standard/Express)
3. Build `Step2Payment.tsx`:
   - Payment method tabs (Card/JazzCash/Easypaisa/COD)
   - Stripe card element (from `@stripe/react-stripe-js`)
   - JazzCash/Easypaisa phone number fields
   - COD instructions
4. Build `Step3Review.tsx`:
   - Order summary
   - Delivery and payment review
   - Place Order button
5. Checkout state managed in component (React useState or useReducer)
6. Order total calculation: subtotal + shipping − discount
7. Coupon code validation endpoint + UI

**Done when:** 3-step checkout flow navigates correctly with proper validation.

---

### Subphase 5.3 — Order Placement & Confirmation

**Pages: C-07**

**Endpoints:**
```
POST   /api/orders              — Create order
GET    /api/orders/:id          — Get order detail
GET    /api/orders              — Get user's orders (paginated)
```

**Tasks:**
1. Write order creation service:
   - Validate all cart items are in stock
   - Deduct stock from variants (atomic transaction)
   - Create Order + OrderItems in single Prisma transaction
   - Create Payment record (status=PENDING)
   - Clear user's cart
   - Send order confirmation email
   - Create in-app notification
2. Build `OrderConfirmationPage.tsx`:
   - Confetti burst animation (`canvas-confetti` library)
   - Animated checkmark (SVG path draw animation)
   - Order details summary
3. Handle payment initiation after order creation (see Phase 10)

**Done when:** Orders created correctly, stock deducted, confirmation page works.

---

### Subphase 5.4 — About, FAQ & Static Pages

**Pages: C-15, C-16, C-18**

**Tasks:**
1. Build `AboutPage.tsx` with all sections and animations
2. Build `FAQPage.tsx` with search + accordion (Radix UI Accordion)
3. Build `NotFoundPage.tsx` (404) with animated illustration
4. Build `AISupportPage.tsx` placeholder (full AI implementation in Phase 9)

**Done when:** Static pages complete, 404 handles unknown routes gracefully.

---

## PHASE 6 — Order Management
**Goal:** Order tracking, history, return requests.

---

### Subphase 6.1 — Order History & Tracking UI

**Pages: C-08, C-09**

**Tasks:**
1. Build `OrderHistoryPage.tsx`:
   - Orders list with status badges
   - Filter by status, date range, search by order ID
2. Build `OrderDetailPage.tsx`:
   - Tracking timeline stepper with pulsing active step
   - Order items with images
   - Delivery address card
   - Download invoice button (calls PDF endpoint)
   - Request return button (if status=DELIVERED)
3. Build `OrderStatusBadge.tsx` reusable component

**Done when:** Full order history and tracking UI functional.

---

### Subphase 6.2 — Admin Order Management

**Tasks:**
1. Build admin `OrderListPage.tsx`:
   - Table with all orders, all customers
   - Status filter tabs, date range, search
   - Status update inline dropdown
   - Tracking number input
2. Build admin `OrderDetailPage.tsx`:
   - All customer info visible
   - Internal notes field
   - Status update + tracking number
   - Print invoice action

**Done when:** Admin can view and manage all orders.

---

### Subphase 6.3 — Return Request System

**Page: C-17**

**Endpoints:**
```
POST   /api/orders/:id/returns   — Submit return request
GET    /api/admin/returns        — List return requests (Admin+)
PATCH  /api/admin/returns/:id    — Update return status (Admin+)
```

**Tasks:**
1. Build 3-step return request form:
   - Step 1: Select items from the order
   - Step 2: Reason + photo upload
   - Step 3: Refund method preference
2. Admin return management page
3. Refund processing note (manual for now, linked to payment phase)

**Done when:** Return requests can be submitted and reviewed by admin.

---

### Subphase 6.4 — Invoice PDF Generation

**Tasks:**
1. Backend: `GET /api/orders/:id/invoice` — generates PDF
2. Use PDFKit to generate a branded invoice:
   - IndusAI logo + branding
   - Order details table
   - Customer and delivery info
   - Payment summary
   - Return policy note
3. Returns PDF as binary response with correct headers
4. Frontend: "Download Invoice" button triggers download

**Done when:** Professional invoice PDF generates for any delivered order.

---

## PHASE 7 — Admin Panel
**Goal:** Complete admin dashboard, product management, customer management.

---

### Subphase 7.1 — Admin Dashboard

**Page: AD-01**

**Tasks:**
1. Build `AdminDashboardPage.tsx`:
   - 4 metric cards: Today's Orders, Revenue, Pending, Low Stock
   - Animated counter on load
2. Build `SalesLineChart.tsx` (Recharts):
   - 7-day/30-day toggle
   - Dark theme styling
3. Build `CategoryDonutChart.tsx` (Recharts)
4. Build `RecentOrdersTable.tsx`:
   - Last 10 orders, status badges, quick actions
5. Build `TopProductsStrip.tsx` — horizontal scroll
6. Build `PendingActionsAlert.tsx` — amber banner for deletion requests

**Done when:** Admin dashboard renders all real data from API.

---

### Subphase 7.2 — Admin Product Management

**Pages: AD-02, AD-03**

**Tasks:**
1. Build `AdminProductListPage.tsx`:
   - Data table with search, category filter, status filter
   - Sortable columns
   - Bulk actions (status toggle)
   - Status badges (green/amber/red for stock levels)
2. Build `AdminProductFormPage.tsx` (shared for Add + Edit):
   - Rich text editor (Tiptap) for description
   - Cloudinary image upload with drag-and-drop
   - Image reorder (drag handles)
   - Dynamic variants table (add/remove rows)
   - Form auto-saves to localStorage as draft
3. Build `DeletionRequestModal.tsx`:
   - Reason textarea
   - Submit for owner approval

**Done when:** Admin can create, edit products with image upload, request deletion.

---

### Subphase 7.3 — Admin Customer Management

**Pages: AD-06, AD-07**

**Tasks:**
1. Build `AdminCustomerListPage.tsx`:
   - Table with search, filter, sort
   - Suspend/activate action per customer
2. Build `AdminCustomerDetailPage.tsx`:
   - Customer profile header
   - Order history table
   - Address book
   - Suspend/Reactivate with confirmation

**Done when:** Admin can view and manage all customers.

---

### Subphase 7.4 — Admin Inventory Management

**Page: AD-09**

**Tasks:**
1. Build `AdminInventoryPage.tsx`:
   - Products grouped by stock alert level (critical/low/moderate)
   - Inline stock quick-edit per product
   - Bulk CSV update upload
2. CSV upload: parse with Papa Parse, validate headers, batch update

**Done when:** Admin can monitor and update inventory levels.

---

### Subphase 7.5 — Admin Notifications & Settings

**Pages: AD-10, AD-11**

**Tasks:**
1. Build `AdminNotificationsPage.tsx`:
   - Notification list with icons and read states
   - Mark all read
   - Preference toggles per notification category
2. Build `AdminSettingsPage.tsx`:
   - Profile update form
   - Password change
   - Login activity log table

**Done when:** Admin notifications and settings pages functional.

---

### Subphase 7.6 — AI Chatbot Widget (Admin Support View)

**Tasks:**
1. Build floating `ChatWidget.tsx`:
   - Gold circle button, bottom-right, all pages
   - Opens glass-blur drawer (380px wide, right side)
   - Chat bubble UI (user right, AI left)
   - Typing indicator animation
2. Connect to `/api/ai/chat` backend (implemented in Phase 9)
3. Quick reply chips: "Track order", "Return policy", "Product help"
4. Show on all customer-facing and admin pages

**Done when:** Chat widget opens on all pages, sends/receives messages.

---

## PHASE 8 — Owner Panel
**Goal:** All owner-exclusive pages.

---

### Subphase 8.1 — Owner Dashboard & Financial Stats

**Pages: OW-01, OW-02**

**Tasks:**
1. Build `OwnerDashboardPage.tsx`:
   - Extended 8 metric cards (2 rows)
   - Multi-line financial overview chart (Revenue/Expenses/Profit)
   - Payment method breakdown donut
   - Pending actions panel
   - Admin activity log
2. Build `OwnerFinancialsPage.tsx`:
   - Date range selector
   - Summary cards
   - Revenue chart with refund overlay
   - Payment method revenue table
   - Product profitability table
   - Export buttons

**Done when:** Owner financial dashboard shows real aggregated data.

---

### Subphase 8.2 — Owner Analytics & Sales Predictions

**Page: OW-03**

**Tasks:**
1. Build `OwnerAnalyticsPage.tsx`:
   - AI Insights panel with TensorFlow predictions
   - Sales by category horizontal bar chart
   - Customer acquisition stacked bar chart
   - Sales heatmap (day × hour grid — Recharts custom cell)
   - Conversion funnel chart
2. Prediction display: confidence badge, trend arrow

**Done when:** Analytics page renders charts and AI predictions.

---

### Subphase 8.3 — User Management & Deletion Approvals

**Pages: OW-04, OW-05**

**Tasks:**
1. Build `OwnerUserManagementPage.tsx`:
   - Tabs: Customers | Administrators
   - Admin tab: add new admin flow (modal + email invite)
   - Suspend/delete admins
2. Build `OwnerDeletionApprovalsPage.tsx`:
   - Pending request cards with product preview
   - Approval modal: type product name to confirm
   - History tab with log

**Done when:** Owner can manage admins and approve/reject deletions.

---

### Subphase 8.4 — System Config & Audit Log

**Pages: OW-06, OW-08, OW-09**

**Tasks:**
1. Build `SystemConfigPage.tsx`:
   - All settings sections with live save
   - Payment method toggles (live/sandbox mode indicators)
   - Maintenance mode with red warning UI
2. Build `AuditLogPage.tsx`:
   - Chronological table of all actions
   - Filters by actor, action, date
   - Export as CSV
3. Build `OwnerSettingsPage.tsx`:
   - Same as admin settings + 2FA setup flow

**Done when:** Owner has full system control and audit visibility.

---

## PHASE 9 — AI Features
**Goal:** All AI-powered features functional.

---

### Subphase 9.1 — OpenAI Smart Search

**Tasks:**
1. Write `services/search.service.ts`:
   - On product create/update: generate embedding via OpenAI Embeddings API
   - Store embedding in DB (pgvector or JSON field + cosine similarity)
   - `semanticSearch(query)` — embed query, find nearest products
2. Fallback: if OpenAI fails, use Prisma full-text search
3. "Did you mean...?" using edit-distance for typo correction
4. Endpoint: `GET /api/search?q=...&type=semantic|basic`

**Done when:** Semantic search returns relevant results, typo correction works.

---

### Subphase 9.2 — AI Product Recommendations

**Tasks:**
1. Write TensorFlow.js collaborative filtering model:
   - Input: user's order history + viewed products
   - Output: product ID scores
   - Simple matrix factorisation or item-item similarity
2. Endpoint: `GET /api/ai/recommendations` (authenticated)
3. Fallback for new users: return top-rated products in their browsed categories
4. Display on: homepage strip, product detail "You may also like"

**Done when:** Recommendations return relevant personalised products.

---

### Subphase 9.3 — AI Customer Support Chatbot

**Tasks:**
1. Write `services/chatbot.service.ts`:
   - System prompt: IndusAI support agent, knows product categories, policies
   - Context injection: user's recent orders, current cart
   - Tool functions: get_order_status, get_product_info, get_return_policy
2. Endpoint: `POST /api/ai/chat`
   - Request: `{ message, conversationHistory[] }`
   - Response: `{ reply, suggestedActions[] }`
3. Conversation history stored in component state (not persisted)
4. Full chat page at `/support`

**Done when:** Chatbot answers questions about orders, products, and policies.

---

### Subphase 9.4 — Sales Prediction (TensorFlow.js)

**Tasks:**
1. Write time-series sales prediction model:
   - Input: 90 days of sales data per category
   - Output: next 30-day forecast
   - Simple LSTM or moving-average model
2. Endpoint: `GET /api/ai/sales-forecast`
3. Owner dashboard: prediction cards with confidence percentage
4. Retrain model weekly with new sales data (cron job)

**Done when:** Owner sees 30-day sales forecast on dashboard.

---

### Subphase 9.5 — AI Search Autocomplete (Frontend)

**Tasks:**
1. As user types in search bar, call autocomplete endpoint (debounced 300ms)
2. Show AI-suggested completions with sparkle icon prefix
3. "Trending searches" when search bar focused but empty
4. Cache autocomplete results for 5 minutes (React Query)

**Done when:** Search bar shows AI-powered suggestions in real-time.

---

## PHASE 10 — Payment Integration
**Goal:** All payment methods working end-to-end.

---

### Subphase 10.1 — Stripe Integration

**Tasks:**
1. Backend:
   - `POST /api/payments/stripe/create-intent` — creates PaymentIntent
   - `POST /api/payments/stripe/webhook` — handles Stripe events
   - Webhook events: payment_intent.succeeded, payment_intent.payment_failed
   - On success: update Payment.status=PAID, update Order.status=PROCESSING
2. Frontend:
   - Install `@stripe/react-stripe-js` and `@stripe/stripe-js`
   - Stripe Elements card form in checkout Step 2
   - Handle payment confirmation with `stripe.confirmCardPayment()`
3. Test with Stripe test cards

**Done when:** Full Stripe payment flow works in test mode.

---

### Subphase 10.2 — JazzCash Integration

**Tasks:**
1. Backend:
   - `POST /api/payments/jazzcash/initiate` — build JazzCash redirect params
   - `POST /api/payments/jazzcash/callback` — handle JazzCash response
   - HMAC-SHA256 hash generation for request integrity
   - Sandbox testing with JazzCash test credentials
2. Frontend:
   - Phone number input for JazzCash
   - Redirect to JazzCash payment page OR OTP flow
   - Return URL handling (redirect back after payment)

**Done when:** JazzCash payment initiates and callback updates order status.

---

### Subphase 10.3 — Easypaisa Integration

**Tasks:**
1. Same pattern as JazzCash
2. Backend: initiate + callback endpoints
3. Hash generation per Easypaisa API spec
4. Sandbox testing

**Done when:** Easypaisa payment flow complete in sandbox.

---

### Subphase 10.4 — Cash on Delivery

**Tasks:**
1. COD order placement: no payment gateway, order goes to PENDING
2. COD fee added to order total (from system config)
3. Admin marks COD orders as PAID on delivery
4. COD availability check: configurable by Owner (on/off toggle)
5. COD not available for orders below minimum amount (configurable)

**Done when:** COD orders placed correctly, admin confirms payment on delivery.

---

## PHASE 11 — Notifications System
**Goal:** Email notifications and in-app notifications.

---

### Subphase 11.1 — Email Notifications

**Tasks:**
1. Write all email templates (HTML, branded):
   - Welcome / email verification
   - Password reset OTP
   - Order placed confirmation (with itemised summary)
   - Order status updates (shipped, delivered)
   - Return request submitted
   - Admin welcome email with temp password
2. Write `notification.service.ts`:
   - `sendOrderEmail(order, event)` — dispatches correct email template
   - `sendStatusUpdateEmail(order)` — on admin status change
3. Queue email sending: use `bull` or simple async (non-blocking)

**Done when:** All email notifications send correctly with branded templates.

---

### Subphase 11.2 — In-App Notifications

**Tasks:**
1. `GET /api/notifications` — paginated list for current user
2. `PATCH /api/notifications/:id/read` — mark as read
3. `PATCH /api/notifications/read-all` — mark all as read
4. `GET /api/notifications/unread-count` — for badge
5. Frontend: notification bell badge updates in real-time (polling every 30s)
6. Notifications page with list and preference toggles

**Done when:** In-app notifications appear and update in real-time.

---

### Subphase 11.3 — SMS OTP (Optional / Twilio)

**Tasks:**
1. Write `utils/sms.ts` (Twilio Verify wrapper):
   - `sendSMSOTP(phone)` — via Twilio Verify service
   - `verifySMSOTP(phone, code)` — verify against Twilio
2. Add SMS as alternative to email OTP in register flow
3. Keep email OTP as primary (cheaper/free) — SMS as premium option
4. Configurable in Owner system settings

**Done when:** SMS OTP works as alternative verification method.

---

## PHASE 12 — Reports & Export
**Goal:** All report types with PDF and Excel export.

---

### Subphase 12.1 — Report Data API

**Endpoints:**
```
GET /api/admin/reports/daily?date=
GET /api/admin/reports/monthly?year=&month=
GET /api/admin/reports/annual?year=
GET /api/admin/reports/purchasing?startDate=&endDate=
GET /api/owner/reports/financial?startDate=&endDate=
```

**Tasks:**
1. Write report queries using Prisma aggregations:
   - Revenue sum, order count, avg order value per period
   - Category breakdown percentages
   - Top products by revenue and units
   - Customer acquisition (new vs returning)
2. Owner financial: include refunds, calculate net revenue

**Done when:** All report endpoints return correct aggregated data.

---

### Subphase 12.2 — PDF Report Export

**Tasks:**
1. Write `utils/reports/pdfReport.ts` (PDFKit):
   - Branded header (logo, report title, date range)
   - Summary metrics section
   - Data tables (orders, products, revenue)
   - Page numbers, footer
2. Endpoint: `GET /api/admin/reports/daily/export?format=pdf`
3. Returns binary PDF with `Content-Disposition: attachment` header
4. Frontend: download button triggers fetch + browser download

**Done when:** All report types exportable as professional branded PDFs.

---

### Subphase 12.3 — Excel Report Export

**Tasks:**
1. Write `utils/reports/excelReport.ts` (ExcelJS):
   - Multiple worksheets per report (Summary, Orders, Products)
   - Formatted headers, bold totals row
   - Column auto-width
   - Number formatting (PKR currency)
2. Same export endpoint pattern with `format=excel`
3. Returns `.xlsx` binary

**Done when:** All report types exportable as formatted Excel files.

---

## PHASE 13 — Testing & Quality Assurance
**Goal:** Ensure production reliability before deployment.

---

### Subphase 13.1 — Backend Unit & Integration Tests

**Tasks:**
1. Install Jest + Supertest for backend
2. Write unit tests for:
   - Auth service (register, login, OTP verify)
   - Product service (CRUD, filters)
   - Order service (creation, stock deduction)
   - Payment service (hash generation for JazzCash/Easypaisa)
3. Write integration tests for critical API flows:
   - Full auth flow (register → verify → login → refresh → logout)
   - Product creation with image upload
   - Order placement with stock deduction
   - Deletion request workflow
4. Test database transactions (rollback on failure)
5. Target: 80% coverage on services layer

**Done when:** All tests pass, 80% service coverage achieved.

---

### Subphase 13.2 — Frontend Component Tests

**Tasks:**
1. Install Vitest + React Testing Library
2. Write tests for critical components:
   - OTPInput (6-box, auto-advance, paste)
   - CartDrawer (add/remove/quantity)
   - CheckoutStepper (navigation, validation)
   - ProductCard (hover states, wishlist toggle)
3. Write tests for Zustand stores
4. Write tests for custom hooks (useAuth, useCart, useCountDown)

**Done when:** Critical frontend components have passing tests.

---

### Subphase 13.3 — End-to-End Flow Testing

**Tasks:**
1. Manual end-to-end testing checklist:
   - [ ] Register → verify email → login
   - [ ] Browse → add to cart → checkout (Stripe test card)
   - [ ] Admin creates product with images
   - [ ] Admin requests deletion → Owner approves
   - [ ] Owner views financial reports → exports PDF
   - [ ] AI chatbot answers order status question
   - [ ] Smart search returns relevant results
2. Cross-browser testing: Chrome, Firefox, Safari, Edge
3. Mobile responsive testing: iPhone SE, iPhone 14, Samsung S23, iPad
4. Performance audit: Lighthouse score ≥90 on all key pages

**Done when:** All flows pass, no critical bugs, Lighthouse ≥90.

---

### Subphase 13.4 — Security Audit

**Tasks:**
1. Check all API endpoints for missing auth middleware
2. Verify RBAC: customer cannot access admin routes
3. Test rate limiting on auth endpoints
4. Verify all inputs sanitised (no XSS via user-submitted content)
5. Check Prisma queries (all use parameterised — safe by default)
6. Verify httpOnly cookie implementation
7. Check no secrets leaked in frontend bundle
8. Review CORS configuration
9. Test: attempt to access other user's orders (should return 403)

**Done when:** No security vulnerabilities found in audit checklist.

---

## PHASE 14 — Deployment & Go-Live
**Goal:** Deploy to production, configure all services.

---

### Subphase 14.1 — Production Environment Setup

**Tasks:**
1. Create production Neon PostgreSQL database (separate from dev)
2. Set up Cloudinary production bucket with upload presets
3. Configure Sentry projects (frontend + backend)
4. Set all production environment variables in:
   - Railway (backend)
   - Vercel (frontend)
5. Run `prisma migrate deploy` on production database
6. Run production seed (owner account + categories only, no sample products)
7. Switch all payment gateways from sandbox to live mode
8. Configure Stripe webhook endpoint (production URL)

**Done when:** Production environment fully configured with all credentials.

---

### Subphase 14.2 — Frontend Deployment (Vercel)

**Tasks:**
1. Connect GitHub repo to Vercel project
2. Configure build settings:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add all `VITE_*` environment variables in Vercel dashboard
4. Configure Vercel rewrites for React Router (SPA fallback)
5. Set up custom domain if available
6. Enable Vercel Analytics
7. Test all routes in production build
8. Verify Cloudflare CDN is active and caching static assets

**Done when:** Frontend deployed, accessible at production URL, all routes work.

---

### Subphase 14.3 — Backend Deployment (Railway)

**Tasks:**
1. Connect GitHub repo to Railway project
2. Configure:
   - Root directory: `backend`
   - Start command: `npm start`
3. Add all environment variables in Railway dashboard
4. Configure health check: `GET /api/health`
5. Enable auto-deploys on main branch push
6. Set up Railway custom domain or use generated URL
7. Configure CORS in production to allow Vercel domain
8. Monitor first production deployment in Sentry
9. Smoke test all critical endpoints in production
10. Write `docs/API.md` — full endpoint documentation

**Done when:** Backend deployed, health check passing, all endpoints accessible.

---

## Phase Completion Checklist

Use this to verify before marking a phase done:

```
[ ] All code follows TypeScript strict mode (no `any` types)
[ ] All API endpoints have Zod validation
[ ] All components handle loading, error, and empty states
[ ] All forms have client-side validation
[ ] No console.log statements left in code
[ ] No hardcoded values (env vars used for all config)
[ ] ESLint passes with no errors
[ ] Git commit made with correct message format
[ ] CLAUDE.md phase tracking section updated
[ ] Code reviewed for security issues
```

---

## Dependency Map (What needs what)

```
Phase 1  → No dependencies (start here)
Phase 2  → Requires Phase 1 complete
Phase 3  → Requires Phase 2 (auth middleware needed for admin routes)
Phase 4  → Requires Phases 2 + 3 (needs auth + product APIs)
Phase 5  → Requires Phases 3 + 4 (needs cart API + product UI)
Phase 6  → Requires Phase 5 (orders need checkout)
Phase 7  → Requires Phases 3 + 6 (admin needs products + orders)
Phase 8  → Requires Phase 7 (owner extends admin)
Phase 9  → Requires Phases 3 + 4 (AI needs products + search UI)
Phase 10 → Requires Phase 5 (payments need checkout flow)
Phase 11 → Requires Phase 6 (notifications triggered by orders)
Phase 12 → Requires Phases 6 + 7 (reports need order + product data)
Phase 13 → Requires all Phases 1-12 complete
Phase 14 → Requires Phase 13 complete
```

---

*IMPLEMENTATION_PLAN.md — IndusAI Technology E-Commerce Platform*
*58 subphases across 14 phases*
*Always read CLAUDE.md before starting any subphase*
