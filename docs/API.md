# IndusAI API Reference

Base URL: `http://localhost:3000/api` (dev)

All responses follow the envelope:

```jsonc
// success
{ "success": true, "data": <T>, "message"?: "...", "pagination"?: { "page", "limit", "total", "totalPages" } }
// error
{ "success": false, "error": { "code": "STRING_CODE", "message": "human readable", "details"?: {} } }
```

---

## Auth — `/api/auth`

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| POST | `/register` | – | `{ name, email, phone, password }` | Creates customer (unverified), emails OTP. Returns user. |
| POST | `/verify-email` | – | `{ userId, otp }` | Marks email verified. |
| POST | `/resend-verification` | – | `{ userId }` | Re-sends the verification OTP. |
| POST | `/login` | – | `{ email, password }` | Sets `indusai_rt` httpOnly cookie; returns `{ user, accessToken }`. 403 `EMAIL_NOT_VERIFIED` (details.userId) if unverified. |
| POST | `/refresh` | cookie | – | Rotates refresh cookie; returns `{ user, accessToken }`. |
| POST | `/logout` | cookie | – | Deletes refresh token + clears cookie. |
| POST | `/forgot-password` | – | `{ email }` | Always 200 (never reveals existence). Emails reset OTP. |
| POST | `/reset-password` | – | `{ email, otp, password }` | Resets password; invalidates all sessions. |
| GET | `/me` | Bearer | – | Current user. |

Access token: `Authorization: Bearer <token>` (15 min). Refresh: httpOnly cookie (7 d, path `/api/auth`).
Rate limit: 5/15min per IP in production (relaxed in dev). Admin login: 3/15min.

---

## Products — `/api/products`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/products` | List with filters + pagination. |
| GET | `/products/featured?limit=8` | Featured products. |
| GET | `/products/flash-deals?limit=8` | Products with `comparePrice > basePrice`. |
| GET | `/products/:slug` | Full detail incl. variants, images, recent reviews, reviewStats. 404 `NOT_FOUND` if missing/inactive. |

### `GET /products` query params

| Param | Type | Example |
|-------|------|---------|
| `category` | category slug | `shirts` |
| `minPrice` / `maxPrice` | number (PKR) | `2000` / `6000` |
| `size` | csv | `M,L` |
| `color` | csv | `Black,White` |
| `brand` | csv | `Velocity` |
| `rating` | 1–5 | `4` (avg ≥ 4) |
| `inStock` | bool | `true` |
| `search` | string | `headphones` (name/desc/brand/tags) |
| `sortBy` | enum | `relevance` \| `price-asc` \| `price-desc` \| `newest` \| `rating` |
| `page` / `limit` | int | `1` / `20` (max 100) |

Each product includes: `category`, `variants[]` (prices as numbers), `images[]` (ordered),
and `reviewStats { average, count, histogram[5] }`. List responses include top-level `pagination`.

---

## Reviews

| Method | Path | Auth | Body | Notes |
|--------|------|------|------|-------|
| GET | `/products/:id/reviews?page&limit&star` | – | – | Paginated reviews + aggregate `stats`. |
| POST | `/products/:id/reviews` | Bearer | `{ rating 1-5, title?, body }` | Requires a DELIVERED order with the product. One per user (409 if dup). |
| DELETE | `/reviews/:id` | Bearer | – | Author deletes own; ADMIN/OWNER moderate any (audited). |

`:id` is the product **UUID** (not slug). List response: `data: { reviews[], stats }` + `pagination`.

---

## Categories — `/api/categories`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/categories` | All categories with `productCount` (active). |
| GET | `/categories/:slug/products` | Products in a category (same query params as `/products`). |

---

## Admin Products — `/api/admin` (Administrator or Owner)

All require `Authorization: Bearer <token>` with role ADMINISTRATOR or OWNER.

| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/admin/products` | product JSON (+ `variants[]`) | Creates product. Auto slug + auto SKU. Audit `PRODUCT_CREATE`. |
| PUT | `/admin/products/:id` | partial product | Updates scalars; variants update-by-id / create (no delete — order refs). |
| PATCH | `/admin/products/:id/status` | `{ isActive }` | Activate / deactivate. |
| POST | `/admin/products/:id/images` | multipart `images` (≤5, ≤5MB) | Uploads to Cloudinary (800×800 WebP). First becomes main. |
| DELETE | `/admin/products/:id/images/:imageId` | – | Removes image (also from Cloudinary); promotes next to main. |
| POST | `/admin/products/:id/request-delete` | `{ reason }` | Creates a pending DeletionRequest; notifies Owners. |

Create/variant body:
```jsonc
{ "name","description","categoryId","brand"?,"tags":[],"basePrice","comparePrice"?,
  "isFeatured"?,"isActive"?, "variants":[{ "size"?,"color"?,"sku"?,"stock","price"? }] }
```

## Admin Customers — `/api/admin/customers` (Administrator or Owner)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/admin/customers` | – | Lists CUSTOMER users. Query: `search` (name/email), `status` (`active`\|`suspended`), `page`, `limit`. Each row has `orderCount` + `totalSpent`. |
| GET | `/admin/customers/:id` | – | Full profile: addresses, order history (summaries), and `stats` (totalOrders/totalSpent). 404 for non-customers. |
| PATCH | `/admin/customers/:id/status` | `{ isActive }` | Activate / suspend. Suspending revokes all refresh tokens (forces logout). Audit `CUSTOMER_SUSPEND` / `CUSTOMER_ACTIVATE`. |

## Admin Activity — `/api/admin/activity` (Administrator or Owner)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/activity` | The signed-in staff member's own recent `AuditLog` entries (incl. `LOGIN`). Query: `limit` (≤100). Used by the settings activity log. |

Staff sign-ins now write a `LOGIN` audit entry (with IP) on successful login.
Profile/password/avatar reuse `/users/me`, `/users/me/password`, `/users/me/avatar` (see Account).

## Admin Inventory — `/api/admin/inventory` (Administrator or Owner)

Stock alert tiers (per variant): **critical** ≤ 2, **low** ≤ 5, **moderate** ≤ 10, else healthy.

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/admin/inventory` | – | Lists variants needing attention (stock ≤ 10) by default. Query: `level` (`critical`\|`low`\|`moderate`), `includeHealthy` (`true` for full catalogue), `search` (product name/SKU), `page`, `limit`. `meta.summary` has critical/low/moderate counts. Ordered by stock asc. |
| PATCH | `/admin/inventory/variants/:id` | `{ stock }` | Inline quick-edit — sets absolute stock. Audit `STOCK_UPDATE`. |
| POST | `/admin/inventory/bulk` | `{ updates: [{ sku, stock }] }` | Batch update by SKU (CSV import; ≤1000 rows). Returns `{ updated, notFound[] }`. Audit `STOCK_BULK_UPDATE`. |

## Owner Financials — `/api/owner` (Owner only)

Money is realised from the Payment ledger: `PAID` = revenue, `REFUNDED` = refund.
The schema has no cost-of-goods field, so profit/margin is intentionally not computed.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/owner/dashboard` | Owner financial dashboard. Query `days` (7\|30\|90, default 30). Returns 8 metrics (gross/net/refunds/orders/paidOrders/AOV/newCustomers/shipping), `financialSeries` (per-day gross/refunds/net), `paymentBreakdown`, `pendingActions`, and `recentActivity` (staff audit log). |
| GET | `/owner/financials` | Detailed range report. Query `from`, `to` (ISO dates; default last 30d). Returns `summary`, `revenueSeries`, `paymentMethods` (orders+revenue), and `productPerformance` (top 10 by realised revenue). |
| GET | `/owner/analytics` | Sales analytics. Query `days` (30\|90\|180, default 90). Returns a TensorFlow.js `forecast` (linear-trend model over daily order volume → 7-day projection with `confidence`/`trend`/`sufficient` flags), `salesByCategory`, weekly `customerAcquisition` (verified/unverified), an order `heatmap` (weekday×hour), and a `funnel` (registered→cart→ordered→delivered, from tracked events only). |

## Owner Products — `/api/owner` (Owner only)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/owner/products/:id/approve-delete` | Archives product (`isActive=false`), marks request APPROVED, notifies requester. |
| POST | `/owner/products/:id/reject-delete` | Marks request REJECTED, product stays active. |

All admin/owner product mutations write an `AuditLog` entry (Owner-visible).

---

## Cart — `/api/cart` (authenticated)

| Method | Path | Body | Notes |
|--------|------|------|-------|
| GET | `/cart` | – | `{ items[], summary: { count, subtotal } }`. |
| POST | `/cart` | `{ productId, variantId?, quantity }` | Sets the line to `quantity` (absolute). 0 removes. Validates active + stock (400 over-stock / missing variant). |
| POST | `/cart/merge` | `{ items: [...] }` | Merges a guest cart (sums quantities, capped at stock). |
| DELETE | `/cart/:itemId` | – | Remove one line. |
| DELETE | `/cart` | – | Clear cart. |

## Wishlist — `/api/wishlist` (authenticated)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/wishlist` | User's wishlist with product summaries. |
| POST | `/wishlist/:productId` | Add (idempotent). Returns updated wishlist. |
| DELETE | `/wishlist/:productId` | Remove. |

---

*Updated through Phase 3.4 — Phase 3 complete.*
