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

## Categories — `/api/categories`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/categories` | All categories with `productCount` (active). |
| GET | `/categories/:slug/products` | Products in a category (same query params as `/products`). |

---

*Updated through Phase 3.1. More endpoints added per phase.*
