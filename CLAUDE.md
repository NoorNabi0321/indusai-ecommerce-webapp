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
CURRENT PHASE: Phase 2 — Database Schema & Authentication
CURRENT SUBPHASE: 2.3 — Auth API Endpoints

Phase 2 Progress:
  2.1 Prisma Schema & DB Setup           [x] Done (Neon migrated + seeded)
  2.2 Auth Service & Utilities           [x] Done (Resend email; console fallback)
  2.3 Auth API Endpoints                 [ ] Next
  2.4 Frontend Auth Stores & API Layer   [ ] Not Started
  2.5 Auth UI Pages                      [ ] Not Started (flip PREVIEW_BYPASS off)

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
