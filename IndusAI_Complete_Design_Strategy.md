# IndusAI Technology — Complete UI/UX Design Strategy
### Dark-First Premium Hybrid Design System

**Design System:** Dark Glassmorphism + Bento Grid + Micro-interactions  
**Tech Stack:** React + TypeScript + Tailwind CSS + Framer Motion + Shadcn/ui  
**Total Pages:** 47 pages across 4 sides (Auth, Customer, Admin, Owner)

---

## Table of Contents

1. [Design System Fundamentals](#1-design-system-fundamentals)
2. [Authentication Pages — 6 pages](#2-authentication-pages)
3. [Customer Side — 18 pages](#3-customer-side)
4. [Admin Side — 13 pages](#4-admin-side)
5. [Owner Side — 10 pages](#5-owner-side)
6. [Shared / Global Components](#6-shared--global-components)
7. [Animation Master Reference](#7-animation-master-reference)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Component Library Reference](#9-component-library-reference)

---

## 1. Design System Fundamentals

### Colour Tokens

```css
/* Dark backgrounds */
--bg-base:       #0D0D0F;   /* Page root */
--bg-surface:    #161618;   /* Cards, panels */
--bg-elevated:   #1F1F22;   /* Dropdowns, popovers */
--bg-overlay:    #2A2A2E;   /* Hover states */

/* Brand accent — gold */
--gold-dim:      #C9902A;   /* Subtle use, borders */
--gold-base:     #E4A93A;   /* Primary CTA background */
--gold-bright:   #F5C054;   /* Hover state on gold */
--gold-glow:     #FDD98A;   /* Text on dark gold */

/* Text */
--text-primary:  #FFFFFF;
--text-secondary:#B0AFAC;
--text-muted:    #6E6D69;
--text-disabled: #3A3A3D;

/* Semantic */
--success:       #2ECC71;
--error:         #E74C3C;
--warning:       #F39C12;
--info:          #3498DB;

/* Glassmorphism */
--glass-bg:      rgba(255, 255, 255, 0.04);
--glass-border:  rgba(255, 255, 255, 0.08);
--glass-blur:    backdrop-filter: blur(12px);
```

### Typography Scale

```
Font families:
  Display:  'Sora', sans-serif          — Hero headlines, page titles
  UI:       'Inter', sans-serif          — All body text, labels, UI
  Numbers:  'Inter' + tabular-nums       — Prices, stats, counters

Scale:
  --text-xs:    11px / 1.4  — Tags, badges, timestamps
  --text-sm:    13px / 1.5  — Captions, helper text
  --text-base:  15px / 1.6  — Body copy, descriptions
  --text-md:    17px / 1.5  — Card titles, subtitles
  --text-lg:    20px / 1.4  — Section headings
  --text-xl:    24px / 1.3  — Page headings
  --text-2xl:   32px / 1.2  — Display headings
  --text-3xl:   48px / 1.1  — Hero headlines
  --text-4xl:   64px / 1.0  — Oversized hero (landing only)

Weights:  400 regular, 500 medium, 600 semibold, 700 bold
```

### Spacing & Layout Grid

```
Base unit: 4px
Common values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

Container max-widths:
  sm:  640px   — Auth pages
  md:  768px   — Checkout, narrow flows
  lg:  1024px  — Listing pages
  xl:  1280px  — Homepage, dashboard
  2xl: 1440px  — Full-width hero sections

Gutter: 24px (desktop), 16px (tablet), 12px (mobile)
```

### Elevation System

```
Level 0 — flat:     no shadow, bg-surface
Level 1 — raised:   box-shadow: 0 1px 3px rgba(0,0,0,0.4)
Level 2 — floating: box-shadow: 0 4px 16px rgba(0,0,0,0.5)
Level 3 — overlay:  box-shadow: 0 8px 32px rgba(0,0,0,0.6) + glass-blur
Level 4 — modal:    box-shadow: 0 16px 64px rgba(0,0,0,0.7) + backdrop dim
```

### Border Radius

```
--radius-sm:   6px    — Tags, badges, small inputs
--radius-md:   10px   — Buttons, form fields, chips
--radius-lg:   14px   — Cards, panels
--radius-xl:   20px   — Large cards, modals
--radius-2xl:  28px   — Hero cards, feature panels
--radius-full: 9999px — Pills, avatars, toggle switches
```

---

## 2. Authentication Pages

**Total: 6 pages**  
**Route prefix:** `/auth/*`  
**Layout:** Centred split — animated gradient mesh left panel + form right panel

### Global Auth Layout

```
Background: --bg-base with animated gradient mesh
  - Three floating colour orbs (gold #E4A93A, deep purple #6C3ABF, dark teal #0F4F4F)
  - Orbs animate: scale(1) → scale(1.15) → scale(1) over 8s, offset between orbs
  - Orbs are blurred (filter: blur(80px)), opacity 0.25

Split layout (desktop ≥ 1024px):
  Left panel (45%):  Brand visual — logo, tagline, product collage or illustration
  Right panel (55%): Form card — glass card centered vertically

Mobile (<1024px):
  Single column, logo at top, form below, gradient mesh as full background
```

---

### Page A-01 — Register (Customer)
**Route:** `/auth/register`

**Layout:**
- Split layout as described above
- Left panel: animated collage of product categories (shirts, shoes, jewellery, electronics) arranged in a 2×2 bento with subtle float animation

**Form card contents:**
```
Header:
  - IndusAI logo (small, gold)
  - Heading: "Create your account"
  - Subtext: "Already have an account?" + Sign in link (gold)

Fields (top to bottom):
  1. Full Name          — text input, icon: person
  2. Email Address      — email input, icon: envelope
  3. Phone Number       — tel input, icon: phone, PKR flag prefix
  4. Password           — password input, icon: lock, show/hide toggle
     — Password strength bar (4 segments: weak/fair/good/strong)
     — Strength animates as user types
  5. Confirm Password   — password input, icon: lock

CTA:
  - Primary button: "Create Account" (gold, full-width)
  - OR divider
  - Google OAuth button (secondary style)

Footer:
  - "By creating an account, you agree to our Terms & Privacy Policy"
  - Links open in modal (not new tab)
```

**Animations:**
- Form fields stagger in (80ms delay each) on page load
- Password strength bar segments fill left-to-right with colour transition
- On submit: button shows loading spinner morphing into checkmark on success
- Error shake animation on failed validation (translateX oscillation, 300ms)

---

### Page A-02 — OTP Verification
**Route:** `/auth/verify-otp`

**Layout:** Single centred card (no split), dark background with gold particle animation

**Card contents:**
```
Header:
  - Envelope icon with animated ping ring (gold)
  - Heading: "Verify your email"
  - Subtext: "We sent a 6-digit code to [email]" (email partially masked)

OTP Input:
  - 6 individual boxes (48×56px each), spaced 8px apart
  - Auto-advance focus on digit entry
  - Paste support (fills all 6 boxes)
  - Active box: gold border glow
  - Filled box: white text on dark surface, gold border
  - Error state: red border + shake animation

Timer:
  - "Resend code in 0:45" countdown
  - On expire: "Resend code" becomes clickable (gold text)

CTA:
  - "Verify" button (gold, full-width), disabled until all 6 filled
```

**Animations:**
- OTP boxes reveal with staggered scale-in (50ms each)
- Countdown timer animates with subtle colour shift as it nears 0
- Success: boxes flash green → check animation → page transition

---

### Page A-03 — Login
**Route:** `/auth/login`

**Layout:** Split layout, left panel shows featured product or brand visual

**Form card contents:**
```
Header:
  - Logo
  - Heading: "Welcome back"
  - Subtext: "New here?" + Register link

Fields:
  1. Email Address
  2. Password + show/hide toggle
  - "Forgot password?" link right-aligned under password field

CTA:
  - "Sign In" button (gold, full-width)
  - OR divider
  - Google OAuth button

Security note:
  - Small lock icon + "Secured with JWT authentication"
```

**Animations:**
- "Welcome back" heading uses a subtle typewriter reveal
- Button loading state → success state transition
- Failed login: card does a subtle horizontal shake

---

### Page A-04 — Forgot Password
**Route:** `/auth/forgot-password`

**Layout:** Single centred card

**Contents:**
```
Step 1 — Email entry:
  - Lock icon (animated open → closed on submit)
  - Heading: "Reset your password"
  - Email input
  - "Send reset link" button

Step 2 — Confirmation (same page, animated transition):
  - Animated envelope flying to destination
  - "Check your email" heading
  - Instructions text
  - "Back to login" link
  - "Didn't receive it? Resend" (after 60s)
```

---

### Page A-05 — Reset Password
**Route:** `/auth/reset-password?token=...`

**Layout:** Single centred card

**Contents:**
```
- New password field + strength bar
- Confirm new password field
- "Reset Password" button
- Automatic redirect to login on success with toast notification
- Expired token state: error card with "Request new link" CTA
```

---

### Page A-06 — Admin / Owner Login
**Route:** `/auth/admin-login`

**Layout:** Different from customer login — darker, more minimal

**Contents:**
```
- Full dark background (no gradient mesh — intentionally stark)
- Centred card with gold top border accent
- "IndusAI Admin Portal" heading
- Email + Password fields
- "Sign In to Dashboard" button
- No OAuth option
- Role badge shown after login (Administrator / Owner)
- Rate limiting notice: "5 attempts remaining" shown after 2 failures
- Security: CAPTCHA appears after 3 failed attempts
```

---

## 3. Customer Side

**Total: 18 pages**  
**Route prefix:** `/` and `/account/*`  
**Layout:** Global navbar + footer, content area between

### Global Customer Layout

```
Navbar (sticky, 64px height):
  Left:   IndusAI logo (gold wordmark)
  Centre: Search bar (expandable, 480px wide on focus)
  Right:  AI assistant icon | Wishlist icon (count badge) |
          Cart icon (count badge) | User avatar / Sign in

  On scroll >80px: navbar gains glass-blur background + bottom border
  Mobile: hamburger menu → full-screen slide-in navigation drawer

Footer (dark surface, 3 columns):
  Col 1: Logo, tagline, social icons
  Col 2: Quick links (Shop, About, FAQ, Returns)
  Col 3: Contact info, newsletter signup
  Bottom bar: Copyright, Terms, Privacy
```

---

### Page C-01 — Homepage (Landing)
**Route:** `/`

**Sections (top to bottom):**

```
1. HERO SECTION (100vh)
   - Full-bleed background: dark with animated gradient orbs
   - Large heading (Sora, 64px): "Shop Premium. Shop Smart."
     → Words animate in one by one (stagger 80ms each)
   - Subheading: "AI-powered recommendations. Local payment. Fast delivery."
   - Two CTAs side-by-side:
     • "Shop Now" — gold filled button
     • "Explore AI Picks" — outlined button
   - Floating product preview cards (3 cards, slight parallax on scroll)
   - Scroll indicator arrow bouncing at bottom

2. CATEGORY STRIP (auto-scroll marquee)
   - 4 categories: Shirts | Shoes | Jewellery | Electronics
   - Each: large background image, category name, product count
   - Card size: 280×360px, border-radius-2xl
   - Hover: slight scale-up (1.03), gold border appears
   - Layout: horizontal scroll on mobile, 4-column on desktop

3. FLASH DEALS (bento grid)
   - Section heading with countdown timer (gold)
   - Large featured deal card (spans 2 cols): hero image + big discount badge
   - 4 smaller deal cards beside/below
   - Each card: product image, original price struck, new price in gold, % off badge
   - "View All Deals" → /deals

4. AI RECOMMENDATIONS (personalised)
   - Heading: "Picked for you" with AI sparkle icon
   - Horizontal scroll of 8 product cards
   - If not logged in: shows popular items, CTA to sign in for personalisation
   - Card design: see Product Card component below

5. TRENDING NOW (social proof strip)
   - 3 animated stat counters on enter viewport:
     • "12,000+ Orders Delivered"
     • "4.8★ Average Rating"
     • "500+ Products"
   - Background: gold-tinted dark surface

6. CATEGORY FEATURE BANNERS (bento 2×2)
   - Shirts banner (top-left, large)
   - Shoes banner (top-right, tall)
   - Jewellery banner (bottom-left)
   - Electronics banner (bottom-right, large)
   - Each: background image, category name, "Shop Now" CTA

7. NEW ARRIVALS
   - 4-column grid of latest products
   - "View All New Arrivals" button

8. NEWSLETTER + APP PROMO
   - Email signup with animated input focus state
   - "Get 10% off your first order" incentive
```

---

### Page C-02 — Product Listing (Category)
**Route:** `/shop/:category` (e.g., `/shop/shirts`)

**Layout: Two-column — sidebar (240px) + main grid**

```
BREADCRUMB:
  Home > Shirts

PAGE HEADER:
  - Category name (large, Sora)
  - Product count "124 products"
  - Sort dropdown (right-aligned): Relevance | Price Low-High | Price High-Low | Newest | Rating

FILTER SIDEBAR (desktop sticky, mobile slide-in drawer):
  Sections (each collapsible):
  - Price Range: dual-handle slider with input fields
  - Size: pill buttons (XS S M L XL XXL)
  - Colour: colour dot swatches with label
  - Brand: checkbox list with search
  - Rating: star filter (4★ and above, etc.)
  - Availability: In Stock toggle
  - Applied filters shown as removable chips above grid
  - "Clear All" link

PRODUCT GRID:
  Layout toggle: Grid (default) | List view
  Grid: 3 columns desktop, 2 tablet, 1 mobile
  Masonry variant: featured/new items get taller cards

PRODUCT CARD (standard):
  - Image area (aspect 1:1, object-fit cover)
    → Hover: second image fades in (crossfade 250ms)
    → Hover: "Quick View" button rises from bottom (translateY)
  - Wishlist heart icon (top-right, toggle fills gold on active)
  - "New" / "Sale" / "Low Stock" badge (top-left)
  - Below image:
    → Product name (2 lines max, truncated)
    → Star rating + review count
    → Price (current gold, original struck-through grey)
    → Size/colour variant dots (max 4, +N more)
  - Hover card elevation lifts (shadow level 2)

PAGINATION:
  - Infinite scroll with "Load more" trigger, OR
  - Numbered pagination component at bottom
```

---

### Page C-03 — Product Listing (Search Results)
**Route:** `/search?q=...`

```
- Same layout as C-02
- Search query shown prominently: 'Results for "white shirt"'
- If 0 results: illustrated empty state + "Try different keywords" + suggestions
- AI-powered "Did you mean...?" suggestion bar
- Related searches chips below the search bar
```

---

### Page C-04 — Product Detail Page
**Route:** `/product/:slug`

**Layout: Two-column above fold, single-column below**

```
LEFT COLUMN (55%):
  IMAGE GALLERY:
  - Main image (large, aspect 4:5 on desktop)
  - Thumbnail strip (horizontal scroll below main image)
    → Click to switch main image
  - Zoom on hover: CSS transform scale within container
  - Image counter "1 / 4" indicator
  - Fullscreen expand button (opens lightbox modal)

RIGHT COLUMN (45%):
  PRODUCT INFO:
  - Breadcrumb navigation
  - Product name (Sora, 24px, bold)
  - Star rating bar + "(47 reviews)" link → scrolls to reviews
  - Brand name with link
  - Price section:
    → Current price (Sora, 32px, gold)
    → Original price (struck, muted)
    → Discount percentage badge
    → "Inclusive of all taxes"

  VARIANT SELECTORS:
  - Colour: labelled swatches (selected shows gold ring)
  - Size: pill buttons (out-of-stock sizes: strikethrough + disabled style)
  - Size guide link → opens modal

  QUANTITY + CART:
  - Quantity selector (- / number / +)
  - "Add to Cart" button (gold, full-width, large 52px)
    → Loading: spinner
    → Success: checkmark with particle burst animation
  - "Add to Wishlist" button (outlined, full-width)

  DELIVERY INFO:
  - COD availability toggle display
  - Estimated delivery date
  - "Free delivery on orders over PKR 2,000"

  TRUST BADGES:
  - Row of 3: 🔒 Secure Checkout | ↩ Easy Returns | ✓ Authentic Products

BELOW FOLD (single column, tabbed):
  Tab 1 — Description:
    Full product description, feature bullets
  Tab 2 — Specifications:
    2-column table of specs (material, dimensions, care instructions, etc.)
  Tab 3 — Reviews:
    - Rating summary: large average score, star histogram bars
    - Review filters: All | 5★ | 4★ | 3★ | 2★ | 1★
    - Individual review cards: avatar, name, date, star rating, text, photos
    - "Write a Review" button (only for logged-in customers who purchased)
  Tab 4 — AI Similar:
    - "Customers also viewed" horizontal scroll
    - AI recommendation engine output
    - "Based on your browsing" personalised section

STICKY ADD-TO-CART BAR:
  - Appears after scrolling past the right column purchase area
  - Sticks to bottom of screen
  - Shows: thumbnail, name, price, "Add to Cart" button
  - Glass-blur background
```

---

### Page C-05 — Shopping Cart
**Route:** `/cart`

**Layout:** Two-column — cart items (65%) + order summary (35%)**

```
LEFT — CART ITEMS:
  - "Your Cart (3 items)" heading
  - Each cart row:
    → Product image (80×80px, rounded)
    → Product name, size, colour
    → Price
    → Quantity selector (- / n / +)
    → Remove button (trash icon, red on hover)
    → "Move to Wishlist" link
  - Out-of-stock items flagged with warning banner
  - Coupon code input field with "Apply" button
  - "Continue Shopping" link

RIGHT — ORDER SUMMARY (sticky):
  - Subtotal
  - Shipping (calculated or "Free")
  - Discount applied (if coupon)
  - Total (large, gold)
  - "Proceed to Checkout" button (gold, large)
  - Payment method icons row
  - "You're PKR 500 away from free shipping" progress bar

EMPTY CART STATE:
  - Illustrated empty cart (Undraw SVG illustration)
  - "Your cart is empty"
  - "Start Shopping" gold button
  - "Your recently viewed" products section below
```

---

### Page C-06 — Checkout
**Route:** `/checkout`

**Layout: Single column with stepper**

```
STEPPER (3 steps, top of page):
  Step 1: Delivery  →  Step 2: Payment  →  Step 3: Review

STEP 1 — DELIVERY:
  - Saved addresses (radio cards with name/address summary)
  - "Add new address" expandable form:
    → Full name, phone, street address, city, province, postal code
  - Delivery type selector: Standard | Express (with price difference)
  - Continue button

STEP 2 — PAYMENT:
  Payment method tabs:
  - Credit/Debit Card (Stripe): card number, expiry, CVV, cardholder name
    → Card brand auto-detected (shows Visa/Mastercard icon)
  - JazzCash: phone number field, sends OTP
  - Easypaisa: phone number field, sends OTP
  - Cash on Delivery: confirmation note + COD fee display

  Security note: "256-bit SSL encrypted"

STEP 3 — REVIEW:
  - Order summary with items
  - Delivery address review
  - Payment method review
  - Final total
  - "Place Order" button (gold, large)
  - Terms checkbox

SIDEBAR (sticky, all steps):
  - Order summary collapsed/expandable
  - Coupon code field
  - Total breakdown
```

---

### Page C-07 — Order Confirmation
**Route:** `/order-confirmation/:orderId`

```
- Full-page confetti burst animation on load (2s, then stops)
- Large animated checkmark (drawn path animation, gold)
- "Order Placed Successfully!" heading
- Order ID prominently displayed
- Estimated delivery date
- Order summary card
- "Track Your Order" button
- "Continue Shopping" button
- Email confirmation notice
```

---

### Page C-08 — Order History
**Route:** `/account/orders`

```
LAYOUT: Account sidebar + content area

ORDERS LIST:
  Each order card:
  - Order ID + date
  - Status badge (Pending / Processing / Shipped / Delivered / Cancelled)
    → Colours: amber/blue/purple/green/red
  - Product thumbnails (max 3, +N more)
  - Total amount
  - "View Details" and "Track Order" buttons

FILTER BAR:
  - Status filter tabs
  - Date range picker
  - Search by order ID

EMPTY STATE:
  - "No orders yet" illustration
  - "Start Shopping" CTA
```

---

### Page C-09 — Order Detail / Tracking
**Route:** `/account/orders/:orderId`

```
ORDER HEADER:
  - Order ID, placed date, status badge

TRACKING TIMELINE:
  - Vertical stepper with animated progress line:
    → Order Placed ✓
    → Payment Confirmed ✓
    → Processing ✓
    → Shipped (current — pulsing dot)
    → Out for Delivery
    → Delivered
  - Each step: icon, label, timestamp (when completed)
  - Active step has gold pulsing ring animation

ORDER ITEMS:
  - Product cards with image, name, qty, price

DELIVERY INFO:
  - Delivery address card
  - Estimated delivery window

ACTIONS:
  - Download Invoice (PDF)
  - Request Return (if delivered)
  - Contact Support (opens AI chat)
```

---

### Page C-10 — Wishlist
**Route:** `/account/wishlist`

```
- Grid layout same as product listing
- "Move to Cart" button on each card
- "Remove" button
- "Share Wishlist" button (generates shareable link)
- "Your wishlist is empty" illustrated state
```

---

### Page C-11 — User Profile
**Route:** `/account/profile`

```
LAYOUT: Account sidebar + content area

PROFILE FORM:
  - Avatar with upload button (circular, initials fallback)
  - Full name, email (read-only, change requires OTP), phone
  - Gender selector
  - Date of birth
  - Save Changes button

PASSWORD SECTION:
  - Current password
  - New password + strength bar
  - Confirm new password
  - Update Password button
```

---

### Page C-12 — Saved Addresses
**Route:** `/account/addresses`

```
- Address cards in a 2-column grid
- Default address has gold badge
- Add/Edit/Delete controls on each
- "Add New Address" card (dashed border, + icon)
- Add/Edit opens inline form (animated expand) or modal
```

---

### Page C-13 — Notifications
**Route:** `/account/notifications`

```
- List of notifications with icons:
  → Order updates (package icon, blue)
  → Promotions (tag icon, gold)
  → Account alerts (shield icon, amber)
- Unread: slightly lighter background row
- Mark all as read button
- Notification preferences toggle panel (email/SMS per category)
```

---

### Page C-14 — AI Chat / Support
**Route:** `/support` (also accessible as floating widget)

```
FLOATING WIDGET (all pages):
  - Gold circle button (bottom-right, 56px)
  - Pulse animation when new message
  - Click opens chat drawer (glass-blur panel, right side, 380px wide)

FULL PAGE VERSION:
  - Standard chat UI layout
  - Message bubbles:
    → User: right-aligned, gold background
    → AI: left-aligned, surface background with AI avatar
  - Typing indicator: 3 animated dots (bounce stagger)
  - Quick reply chips (pre-built common questions)
  - Message input + send button
  - Suggested actions: "Track my order" | "Return policy" | "Product help"
```

---

### Page C-15 — About Us
**Route:** `/about`

```
HERO: Dark background, brand tagline, animated text
MISSION SECTION: Full-width text + illustration (Storyset SVG)
STATS SECTION: Animated counters (orders, customers, products, cities)
TEAM SECTION: Photo grid with name/role (or illustrations if no real photos)
BRAND VALUES: 3-column icon + text cards
CONTACT SECTION: Map placeholder, address, phone, email
```

---

### Page C-16 — FAQ
**Route:** `/faq`

```
- Search bar at top (filters questions as you type)
- Accordion sections by category:
  → Orders & Delivery
  → Payments
  → Returns & Refunds
  → Account
  → Products
- Each question: smooth expand/collapse (Framer Motion layout animation)
- "Still need help?" CTA at bottom → AI Support
```

---

### Page C-17 — Return / Refund Request
**Route:** `/account/returns/new`

```
FORM FLOW (3 steps):
  Step 1: Select order + items to return
  Step 2: Reason selection (dropdown) + description + photo upload
  Step 3: Refund method selection (original payment / store credit)

- Each step animated slide transition
- Confirmation page with return ID and instructions
```

---

### Page C-18 — 404 / Error Page
**Route:** `/*` (catch-all)

```
- Animated illustrated character (404 SVG)
- "Oops! Page not found"
- "Go to Homepage" and "Go Back" buttons
- Search bar (user might have mistyped a product URL)
- Dark background with subtle floating particles
```

---

## 4. Admin Side

**Total: 13 pages**  
**Route prefix:** `/admin/*`  
**Layout:** Sidebar (240px) + top bar (56px) + content area  
**Note:** Admins cannot permanently delete. Deletion triggers approval workflow.

### Global Admin Layout

```
SIDEBAR (fixed, dark surface #161618):
  - IndusAI logo + "Admin" role badge
  - Navigation sections:
    → Dashboard (home icon)
    → Products (box icon)
    → Orders (shopping bag icon)
    → Customers (users icon)
    → Reports (chart icon)
    → Notifications (bell icon)
  - Bottom: Avatar, name, "Sign Out"
  - Collapsed mode (64px wide, icon-only) on smaller screens
  - Active item: gold left border + slightly lighter background

TOP BAR:
  - Page title (dynamic)
  - Breadcrumb
  - Notification bell with badge
  - Admin avatar
```

---

### Page AD-01 — Admin Dashboard
**Route:** `/admin/dashboard`

```
BENTO METRIC CARDS (row of 4):
  - Total Orders Today     → number, % vs yesterday arrow
  - Total Revenue Today    → PKR amount, sparkline
  - Pending Orders         → number, amber badge if >10
  - Low Stock Alerts       → count, red badge if >0
  All cards: animated counter on load, subtle hover lift

CHARTS ROW:
  Left (60%): Sales over time — line chart (7 days / 30 days toggle)
  Right (40%): Orders by category — donut chart

RECENT ORDERS TABLE:
  - Last 10 orders
  - Columns: Order ID | Customer | Items | Total | Status | Date | Actions
  - Status badges with colour coding
  - "View All Orders" link

TOP PRODUCTS:
  - Horizontal cards, 4 visible, scroll right
  - Product image, name, units sold, revenue

PENDING APPROVALS ALERT:
  - If any deletion requests pending → amber alert banner at top
  - Click → goes to Products page filtered to pending
```

---

### Page AD-02 — Product Management
**Route:** `/admin/products`

```
TOP BAR:
  - "Products" heading + total count
  - Search input
  - Category filter dropdown
  - Status filter (Active / Inactive / Pending Deletion)
  - "Add Product" button (gold)

PRODUCTS TABLE:
  Columns: Image | Name | Category | SKU | Price | Stock | Status | Actions
  - Stock column: green if >10, amber if 2-10, red if 0-1
  - Actions: Edit (pencil) | Request Delete (trash, sends to Owner)
  - Row hover: slight background change
  - Bulk select checkboxes (for bulk status change)

FILTERS:
  - Category tabs below heading
  - Sort options

PAGINATION:
  - 20 per page, pagination controls at bottom
```

---

### Page AD-03 — Add / Edit Product
**Route:** `/admin/products/new` and `/admin/products/:id/edit`

```
TWO-COLUMN FORM LAYOUT:
  Left (main, 65%):
    - Product Name (text, required)
    - Description (rich text editor — basic: bold, italic, lists, links)
    - Category (dropdown: Shirts / Shoes / Jewellery / Electronics)
    - Subcategory (dynamic based on category)
    - Tags (chip input)

    IMAGE UPLOAD SECTION:
    - Drag-and-drop zone (Cloudinary upload)
    - "Main image" slot (required, 800×800px recommended)
    - Up to 5 additional images
    - Preview thumbnails with remove button
    - Cloudinary auto-normalises to 800×800, WebP

    VARIANTS SECTION (dynamic):
    - "Add Variant" button creates variant row
    - Each row: Size | Colour | SKU | Stock Quantity | Price Override
    - Drag to reorder

  Right (sidebar, 35%):
    - Price (PKR)
    - Compare-at price (original / strike-through)
    - Status toggle (Active / Inactive)
    - Stock quantity (if no variants)
    - SKU (auto-generated or manual)
    - Weight (for shipping calc)
    - Featured product toggle
    - Save button (sticky at bottom of sidebar)
    - "Save Draft" secondary option
```

---

### Page AD-04 — Order Management
**Route:** `/admin/orders`

```
TOP SUMMARY STRIP (4 stat cards):
  Pending | Processing | Shipped | Delivered counts

ORDERS TABLE:
  Columns: Order ID | Customer | Date | Items | Total | Payment | Status | Actions
  - Payment column: method icon + status (Paid / Pending / Failed)
  - Actions: View Details | Update Status | Print Invoice

FILTERS:
  - Status filter tabs (All | Pending | Processing | Shipped | Delivered | Cancelled)
  - Date range picker
  - Payment method filter
  - Search by Order ID or customer name

STATUS UPDATE:
  - Click status badge → opens inline dropdown to update
  - Status change triggers notification to customer
```

---

### Page AD-05 — Order Detail (Admin View)
**Route:** `/admin/orders/:orderId`

```
- Same tracking timeline as customer view
- Additional admin fields:
  → Internal notes (textarea, not visible to customer)
  → Status updater (dropdown + "Update" button)
  → Tracking number input field
  → Assign courier dropdown
- Order items with stock reservation status
- Customer info panel (click opens customer profile)
- Payment details (method, transaction ID, timestamp)
- Print Invoice button
```

---

### Page AD-06 — Customer Management
**Route:** `/admin/customers`

```
CUSTOMERS TABLE:
  Columns: Avatar | Name | Email | Phone | Orders | Total Spent | Joined | Status | Actions
  - Status: Active / Suspended
  - Actions: View Profile | Suspend/Activate

SEARCH + FILTER:
  - Search by name/email
  - Status filter
  - Sort by: newest / most orders / highest spend
```

---

### Page AD-07 — Customer Profile (Admin View)
**Route:** `/admin/customers/:customerId`

```
CUSTOMER HEADER:
  - Avatar, name, email, phone, join date
  - Total orders, total spent
  - Suspend / Reactivate button

ORDER HISTORY:
  - Table of all orders by this customer
  - Same format as order list

ADDRESS BOOK:
  - Saved addresses displayed as cards
```

---

### Page AD-08 — Reports
**Route:** `/admin/reports`

```
REPORT TYPE SELECTOR:
  Tab row: Daily | Monthly | Annual | Purchasing

DAILY REPORT:
  - Date picker (default: today)
  - Revenue summary, orders count, top products
  - Orders table for that day
  - Export: PDF | Excel buttons

MONTHLY REPORT:
  - Month/year picker
  - Revenue chart (line), orders per day
  - Category breakdown donut
  - Best and worst performers

ANNUAL REPORT:
  - Year selector
  - Month-by-month revenue bar chart
  - Growth percentage vs previous year
  - Top 10 products of the year

PURCHASING REPORT:
  - Inventory purchased vs sold analysis
  - Low stock alerts
  - Restock recommendations (basic calculation)

EXPORT BUTTONS:
  - "Download PDF" (PDFKit)
  - "Download Excel" (ExcelJS)
  - Loading state during generation
```

---

### Page AD-09 — Inventory Alerts
**Route:** `/admin/inventory`

```
- Products grouped by alert level:
  → Critical (0 stock): red section
  → Low (1-5 units): amber section
  → Moderate (6-20 units): blue section
- "Update Stock" inline quick-edit per product
- Bulk update via CSV upload option
```

---

### Page AD-10 — Notifications (Admin)
**Route:** `/admin/notifications`

```
- System notifications:
  → New orders placed
  → Low stock alerts
  → Customer support messages
  → Deletion requests awaiting Owner approval
- Read / Unread states
- Mark all read button
- Notification settings panel
```

---

### Page AD-11 — Account Settings (Admin)
**Route:** `/admin/settings`

```
- Profile info update (name, email requires OTP)
- Password change
- Notification preferences
- Login activity log (last 5 sessions with IP, device, timestamp)
- "Report Suspicious Activity" link
```

---

### Page AD-12 — Deletion Request Review
**Route:** `/admin/products/:id/request-delete`

```
- Product summary card
- Reason for deletion (required textarea)
- "Submit for Owner Approval" button
- After submission: status changes to "Pending Deletion"
- Admin can cancel request before Owner acts
```

---

### Page AD-13 — 403 Unauthorised
**Route:** `/admin/403`

```
- "Access Restricted" heading
- Explanation of which role is required
- "Go to Dashboard" button
- Contact Owner note
```

---

## 5. Owner Side

**Total: 10 pages**  
**Route prefix:** `/owner/*`  
**Layout:** Same sidebar structure as Admin but with additional navigation items  
**Note:** Owner has full access — can see all admin pages plus exclusive owner pages

### Global Owner Layout

```
SIDEBAR additions over Admin:
  → Financial Stats (currency icon) — Owner exclusive
  → Deletion Approvals (shield icon) — Owner exclusive
  → User Management (user-cog icon) — Owner exclusive
  → System Configuration (settings icon) — Owner exclusive

Role badge in sidebar shows "Owner" in gold
```

---

### Page OW-01 — Owner Dashboard
**Route:** `/owner/dashboard`

```
EXTENDED BENTO METRICS (2 rows of 4 cards):
  Row 1 (same as admin):
    Today's Orders | Today's Revenue | Pending Orders | Low Stock

  Row 2 (owner-exclusive):
    Total Revenue (all time) | Total Profit Margin | Active Customers | Admin Users

FINANCIAL OVERVIEW CHART:
  - Revenue vs Expenses vs Profit (multi-line chart)
  - Period selector: 7d / 30d / 90d / 1y

PAYMENT METHOD BREAKDOWN:
  - Donut chart: Stripe % | JazzCash % | Easypaisa % | COD %
  - Table below with actual amounts

PENDING ACTIONS PANEL:
  - Deletion requests awaiting approval (count badge)
  - Any suspended customers
  - System alerts from Sentry

ADMIN ACTIVITY LOG:
  - Last 10 actions by administrators
  - Timestamp, admin name, action description
```

---

### Page OW-02 — Financial Statistics
**Route:** `/owner/financials`

```
DATE RANGE SELECTOR (top, prominent):
  Quick: Today | This Week | This Month | This Year | Custom

SUMMARY CARDS ROW:
  Gross Revenue | Total Refunds | Net Revenue | Platform Costs (manual input)

REVENUE CHART:
  - Line chart with revenue and refund overlay
  - Toggle: Daily / Weekly / Monthly granularity

PAYMENT METHOD REVENUE TABLE:
  - Method | Transactions | Volume | % of Total | Avg Order Value
  - Row for each: Stripe, JazzCash, Easypaisa, COD

PRODUCT PROFITABILITY:
  - Table: Product | Units Sold | Revenue | Category
  - Sortable columns

EXPORT:
  - Full financial report PDF
  - Excel with raw data
```

---

### Page OW-03 — Sales Analytics
**Route:** `/owner/analytics`

```
AI-POWERED INSIGHTS PANEL:
  - TensorFlow predictions:
    → "Expected revenue next 30 days: PKR X,XXX,XXX"
    → "Trending category: Electronics (+32%)"
    → "Low demand alert: Jewellery (-15%)"
  - Each insight has a confidence percentage badge

CHARTS SECTION:
  - Sales by category (horizontal bar chart)
  - Customer acquisition (new vs returning, stacked bar)
  - Geographic heatmap placeholder (city-level)
  - Sales by time of day (heatmap grid: days × hours)

CONVERSION FUNNEL:
  - Visited → Added to Cart → Checkout Started → Purchased
  - Funnel chart with drop-off percentages
  - Each stage clickable for detail

TOP PERFORMING PRODUCTS TABLE:
  - Rank, product, category, units, revenue, rating
```

---

### Page OW-04 — User Management
**Route:** `/owner/users`

```
TABS: Customers | Administrators

CUSTOMERS TAB:
  - Same as admin customer management but with more actions:
    → Permanently delete account (with confirmation dialog)
    → View full purchase history

ADMINISTRATORS TAB:
  - Admin accounts table: Name | Email | Joined | Last Active | Status
  - "Add Administrator" button:
    → Opens modal: name, email, temporary password
    → Role is always "Administrator" (Owner cannot create another Owner)
  - Edit admin (change name/email)
  - Suspend / Reactivate admin
  - "Delete Admin Account" with confirmation

INVITE FLOW:
  - System sends email with temporary password
  - Admin must change password on first login
```

---

### Page OW-05 — Deletion Approvals
**Route:** `/owner/deletions`

```
PENDING REQUESTS:
  Each request card:
  - Product image, name, SKU, category
  - Requesting admin name + timestamp
  - Reason provided
  - "Approve" button (red — permanently deletes)
  - "Reject" button (returns product to active)
  - "View Product" link (preview before deciding)

APPROVAL MODAL:
  - "Are you sure? This permanently deletes [product name] and cannot be undone."
  - Type product name to confirm (safety measure)
  - Confirm deletion button

HISTORY TAB:
  - Log of all past approvals and rejections
  - Filtered by date, admin, decision
```

---

### Page OW-06 — System Configuration
**Route:** `/owner/config`

```
SECTIONS:

General Settings:
  - Store name, tagline, contact email
  - Currency display (PKR)
  - Timezone setting
  - Logo upload

Shipping Settings:
  - Free shipping threshold (PKR amount)
  - COD availability toggle + COD fee
  - Standard delivery days estimate
  - Express delivery days estimate + fee

Notification Settings:
  - System-wide email notification toggles
  - Admin notification preferences

Payment Settings:
  - Stripe: live/test mode toggle (shows current mode clearly)
  - JazzCash: live/sandbox toggle
  - Easypaisa: live/sandbox toggle
  - COD: enable/disable

Maintenance Mode:
  - Toggle with clear warning: "Customers will see a maintenance page"
  - Custom maintenance message input
  - Scheduled end time
```

---

### Page OW-07 — All Reports (Owner)
**Route:** `/owner/reports`

```
- Same as Admin reports (AD-08) with additional:
  → Financial reports tab (revenue, refunds, profit)
  → Admin activity reports (who did what, when)
  → Export all data option
  → Report scheduling: "Email me monthly report" toggle
```

---

### Page OW-08 — Platform Audit Log
**Route:** `/owner/audit`

```
- Chronological log of all significant actions:
  → Product created/edited/deleted
  → Order status changes
  → Customer suspensions
  → Admin additions/removals
  → Config changes
  → Login events (with IP)
- Columns: Timestamp | Actor | Role | Action | Target | IP Address
- Filter: by actor, action type, date range
- Export log as CSV
```

---

### Page OW-09 — Account Settings (Owner)
**Route:** `/owner/settings`

```
- Same as Admin settings (AD-11) plus:
  → Two-factor authentication setup (additional security for Owner)
  → Recovery codes display
  → API access management (if needed in future)
  → Account deletion (self-only, with extreme confirmation flow)
```

---

### Page OW-10 — Owner 403 / Access Escalation
**Route:** Not a page — this role has no 403 for platform features

```
- Any attempt to access non-existent route → redirects to Owner Dashboard
- If session expires: redirect to /auth/admin-login with "Session expired" toast
```

---

## 6. Shared / Global Components

### Toast Notification System

```
Position: bottom-right, stacked (max 3 visible)
Types:
  - Success: green left border + check icon
  - Error:   red left border + X icon
  - Warning: amber left border + alert icon
  - Info:    blue left border + info icon
Animation: slide-in from right (300ms), auto-dismiss after 4s
Progress bar at bottom shows time remaining
```

### Modal System

```
Backdrop: rgba(0,0,0,0.7) blur(4px)
Modal card: --bg-elevated, border-radius-xl, max-width varies
Animation: scale(0.95) → scale(1) + fade, 200ms
Close: X button top-right, Escape key, click backdrop
Focus trap: keyboard navigation stays within modal
```

### Confirmation Dialog

```
Smaller modal variant
Icon (colour matches action severity)
Title + description
Cancel button (outlined) + Confirm button (filled, colour matches severity)
Destructive actions: confirm button is red
```

### Product Card (Reusable)

```
Sizes: sm (160px) | md (220px) | lg (280px)
Variants: vertical (default) | horizontal (list view)
States: default | hover | loading skeleton | out-of-stock (overlay)
```

### Skeleton Loaders

```
Used for: product grids, tables, dashboard metrics, order lists
Animation: shimmer effect (gradient sweep left-to-right, 1.5s loop)
Match the exact shape of the content they replace
```

### Global Search (expanded)

```
Trigger: click search bar in navbar
Opens: full-width search overlay (dark background, white input)
Sections (as user types):
  - Recent searches (chips)
  - AI suggestions (sparkle icon prefix)
  - Product results (with thumbnail)
  - Category shortcuts
  - "Search for [query]" fallback row
Press Enter → goes to /search?q=...
```

---

## 7. Animation Master Reference

```
LIBRARY: Framer Motion (primary), CSS transitions (micro)

TIMING:
  Instant:      0ms    — Toggle state changes
  Fast:         150ms  — Hover effects, focus rings
  Standard:     250ms  — Card hovers, button presses
  Smooth:       350ms  — Dropdowns, tooltips
  Transition:   500ms  — Page transitions, modal open/close
  Story:        800ms  — Hero animations, illustrated states

EASING:
  ease-out:     Most interactions (natural deceleration)
  spring:       Framer Motion spring (stiffness 300, damping 30) — bouncy elements
  ease-in-out:  Loading states, progress bars

SCROLL ANIMATIONS (Framer Motion whileInView):
  Cards:       translateY(24px) → (0) + opacity 0→1, stagger 80ms
  Headings:    translateY(16px) → (0) + opacity 0→1
  Stats:       counter from 0 to value on enter viewport

REDUCED MOTION:
  All animations wrapped in:
  @media (prefers-reduced-motion: reduce) { animation: none; transition: none; }
  Or Framer Motion: useReducedMotion() hook

PAGE TRANSITIONS (React Router + Framer Motion AnimatePresence):
  Enter: opacity 0→1 + translateY(8px)→(0), 400ms ease-out
  Exit:  opacity 1→0 + translateY(-4px), 200ms ease-in
```

---

## 8. Responsive Breakpoints

```
xs:   <480px   — Small mobile
sm:   480px    — Mobile
md:   768px    — Tablet
lg:   1024px   — Small desktop
xl:   1280px   — Desktop
2xl:  1536px   — Large desktop

KEY LAYOUT CHANGES:

Navbar:
  ≥lg: Full navbar with all elements visible
  <lg: Logo + hamburger menu only, search in drawer

Homepage Hero:
  ≥lg: Text left, product preview right
  <lg: Stacked, text centred

Product Grid:
  ≥xl: 4 columns
  lg:  3 columns
  md:  2 columns
  <md: 1 column (or 2 compact)

Product Detail:
  ≥lg: Side-by-side (image left, info right)
  <lg: Stacked (image top, info below, sticky cart bar at bottom)

Admin Sidebar:
  ≥lg: Fixed 240px sidebar
  <lg: Hidden, opened via hamburger icon (overlay drawer)

Checkout:
  ≥md: Stepper horizontal
  <md: Stepper vertical, order summary collapsed/expandable
```

---

## 9. Component Library Reference

### Installation

```bash
# Core dependencies
npm install framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-toast
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog sheet toast

# Styling
npm install tailwindcss autoprefixer postcss
npm install clsx tailwind-merge

# Forms
npm install react-hook-form zod @hookform/resolvers

# Charts (Admin/Owner dashboard)
npm install recharts

# Image handling
npm install @cloudinary/react @cloudinary/url-gen

# Rich text editor (product description)
npm install @tiptap/react @tiptap/starter-kit
```

### Tailwind Config (key additions)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0D0D0F',
          surface:  '#161618',
          elevated: '#1F1F22',
          overlay:  '#2A2A2E',
        },
        gold: {
          dim:    '#C9902A',
          base:   '#E4A93A',
          bright: '#F5C054',
          glow:   '#FDD98A',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        ui:      ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
}
```

### Key Reusable Component Files

```
src/
  components/
    ui/               ← Shadcn primitives
    layout/
      Navbar.tsx
      Footer.tsx
      AdminSidebar.tsx
      AuthLayout.tsx
    product/
      ProductCard.tsx
      ProductGrid.tsx
      ProductGallery.tsx
    cart/
      CartDrawer.tsx
      OrderSummary.tsx
    common/
      SkeletonCard.tsx
      OTPInput.tsx
      PasswordStrength.tsx
      ConfirmDialog.tsx
      StatusBadge.tsx
      StarRating.tsx
      PriceDisplay.tsx
      AnimatedCounter.tsx
    charts/
      SalesChart.tsx
      CategoryDonut.tsx
      RevenueOverview.tsx
    ai/
      ChatWidget.tsx
      RecommendationStrip.tsx
```

---

## Summary — Page Count

| Side         | Pages | Routes                          |
|--------------|-------|---------------------------------|
| Auth         | 6     | `/auth/*`                       |
| Customer     | 18    | `/` and `/account/*`            |
| Admin        | 13    | `/admin/*`                      |
| Owner        | 10    | `/owner/*`                      |
| **Total**    | **47**| —                               |

---

*Design Strategy Document — IndusAI Technology E-Commerce Platform v1.0*  
*Prepared for Claude Code development reference*  
*Aligned with SRS Version 1.0 — May 2026*
