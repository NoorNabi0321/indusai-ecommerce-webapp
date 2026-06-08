# API Credentials Collection Guide
### IndusAI Technology E-Commerce Platform

---

## Table of Contents

1. [Stripe — Card Payments](#1-stripe--card-payments)
2. [JazzCash — Pakistan Wallet](#2-jazzcash--pakistan-wallet)
3. [Easypaisa — Pakistan Wallet](#3-easypaisa--pakistan-wallet)
4. [OpenAI — AI Chatbot & Smart Search](#4-openai--ai-chatbot--smart-search)
5. [SendGrid — Email Notifications & OTP](#5-sendgrid--email-notifications--otp)
6. [Twilio — SMS OTP](#6-twilio--sms-otp)
7. [Cloudinary — Image Storage](#7-cloudinary--image-storage)
8. [Neon PostgreSQL — Database](#8-neon-postgresql--database)
9. [Railway — Backend Hosting](#9-railway--backend-hosting)
10. [Vercel — Frontend Hosting](#10-vercel--frontend-hosting)
11. [Cloudflare — CDN](#11-cloudflare--cdn)
12. [Sentry — Error Monitoring](#12-sentry--error-monitoring)
13. [Storing Credentials Safely](#13-storing-credentials-safely)

---

## 1. Stripe — Card Payments

**Website:** https://stripe.com

### Steps
1. Go to stripe.com and click **Start now**
2. Sign up with your email and verify your account
3. From the dashboard, go to **Developers → API Keys**
4. You will see two keys immediately available:
   - `Publishable key` — starts with `pk_test_`
   - `Secret key` — starts with `sk_test_`
5. These are your **test mode** keys, usable right away with no business registration

### Credentials to Save
```
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### Notes
- Test mode is free forever and does not process real money
- Use test card number `4242 4242 4242 4242` for development
- For live mode, you will need to complete business verification under **Settings → Business**

---

## 2. JazzCash — Pakistan Wallet

**Website:** https://sandbox.jazzcash.com.pk

### Steps
1. Go to the JazzCash Developer Portal at https://developer.jazzcash.com.pk
2. Click **Register** and create a developer account using your email
3. After login, navigate to **My Apps → Create New App**
4. Fill in the application name and description
5. Once the app is created, you will receive:
   - `Merchant ID`
   - `Password`
   - `Integrity Salt` (used for hash generation)
6. These credentials are for the **sandbox environment** only

### Credentials to Save
```
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_SANDBOX_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API
```

### Notes
- Sandbox testing is free with no real transactions
- For live credentials, a registered business in Pakistan is required
- Contact JazzCash at merchantsupport@jazzcash.com.pk for live onboarding

---

## 3. Easypaisa — Pakistan Wallet

**Website:** https://easypaisa.com.pk/business

### Steps
1. Visit https://easypaisa.com.pk/business and click **Partner With Us**
2. Fill in the merchant inquiry form with your business details
3. Easypaisa will respond via email with sandbox access credentials
4. Alternatively, visit the Easypaisa developer documentation at https://easypay.easypaisa.com.pk
5. Register for a developer account and request sandbox credentials

### Credentials to Save
```
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_HASH_KEY=your_hash_key
EASYPAISA_SANDBOX_URL=https://easypay.easypaisa.com.pk/tpg
```

### Notes
- Easypaisa requires manual contact for sandbox access unlike Stripe
- Response time from their team is typically 2 to 5 business days
- For development, you may temporarily focus on Stripe and JazzCash first

---

## 4. OpenAI — AI Chatbot & Smart Search

**Website:** https://platform.openai.com

### Steps
1. Go to platform.openai.com and sign up or log in
2. After login, click your profile icon in the top right and select **API Keys**
3. Click **Create new secret key**
4. Give it a name like `indusai-ecommerce-dev`
5. Copy the key immediately — it is only shown once

### Credentials to Save
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

### Notes
- Add a spending limit under **Settings → Billing → Usage Limits** to avoid unexpected charges
- Start with a $5 or $10 credit top-up which is sufficient for months of development
- The same API key works for both Chat Completions (chatbot) and Embeddings (smart search)

---

## 5. SendGrid — Email Notifications & OTP

**Website:** https://sendgrid.com

### Steps
1. Go to sendgrid.com and click **Start For Free**
2. Sign up with your email address
3. Verify your email and complete the basic onboarding survey
4. From the dashboard, go to **Settings → API Keys**
5. Click **Create API Key**, choose **Full Access**, and give it a name
6. Copy the API key shown — it is only displayed once
7. Next, go to **Settings → Sender Authentication** and verify a sender email address you own

### Credentials to Save
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Notes
- Free tier allows 100 emails per day which is more than enough for development
- Sender authentication is required before any emails can be sent
- Use a real email address you control for the sender verification step

---

## 6. Twilio — SMS OTP

**Website:** https://twilio.com

### Steps
1. Go to twilio.com and click **Sign up**
2. Verify your phone number during signup
3. After entering the dashboard, note your **Account SID** and **Auth Token** visible on the main page
4. Go to **Phone Numbers → Manage → Buy a Number** to get a Twilio trial number for sending SMS
5. For OTP specifically, go to **Verify → Services → Create New Service**
6. Name the service (e.g., `indusai-otp`) and note the **Service SID**

### Credentials to Save
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

### Notes
- Trial account gives approximately $15 free credit
- During trial, SMS can only be sent to verified phone numbers
- If you want to avoid SMS costs entirely, use SendGrid Email OTP instead which is free

---

## 7. Cloudinary — Image Storage

**Website:** https://cloudinary.com

### Steps
1. Go to cloudinary.com and click **Sign up for free**
2. Fill in your name, email, and choose a **Cloud Name** — this is permanent, choose carefully
3. After login, your credentials are visible on the **Dashboard** immediately
4. You will see three values displayed directly on the dashboard home screen

### Credentials to Save
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxx
```

### Notes
- Free tier includes 25GB storage and 25GB monthly bandwidth
- You can set upload presets to auto-resize and normalize product images to 800x800
- Go to **Settings → Upload → Add upload preset** to configure automatic transformations

---

## 8. Neon PostgreSQL — Database

**Website:** https://neon.tech

### Steps
1. Go to neon.tech and click **Sign up** — you can use GitHub login
2. After login, click **Create Project**
3. Name your project (e.g., `indusai-ecommerce`) and select a region closest to you
4. Neon will create a database and show you the **Connection String** immediately
5. Copy the full connection string from the dashboard

### Credentials to Save
```
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
```

### Notes
- Free tier provides 0.5GB storage which is sufficient for development
- Neon provides separate connection strings for **main branch** (production) and **dev branches**
- Use the dev branch connection string during local development to protect production data

---

## 9. Railway — Backend Hosting

**Website:** https://railway.app

### Steps
1. Go to railway.app and click **Login** — use GitHub login for easiest setup
2. Click **New Project → Deploy from GitHub Repo**
3. Connect your GitHub account and select your backend repository
4. Railway will auto-detect Node.js and deploy
5. Go to your service **Settings → Variables** to add environment variables
6. Under **Settings → Domains**, generate a public domain for your backend

### Credentials to Save
```
RAILWAY_PROJECT_URL=https://your-app.up.railway.app
```

### Notes
- Free tier gives $5 credit per month
- Environment variables are added directly in the Railway dashboard, not in code
- Add all your other API keys here as environment variables for the deployed backend

---

## 10. Vercel — Frontend Hosting

**Website:** https://vercel.com

### Steps
1. Go to vercel.com and click **Sign Up** — use GitHub login
2. Click **Add New → Project**
3. Import your frontend GitHub repository
4. Vercel will auto-detect React and configure build settings
5. Click **Deploy** — your site will be live in under a minute
6. For environment variables, go to **Project Settings → Environment Variables**

### Credentials to Save
```
VERCEL_PROJECT_URL=https://your-app.vercel.app
```

### Notes
- Hobby tier is free forever and supports custom domains
- Environment variables added in Vercel are available during build and runtime
- Connect your Vercel project to Railway backend URL via an environment variable like `VITE_API_URL`

---

## 11. Cloudflare — CDN

**Website:** https://cloudflare.com

### Steps
1. Go to cloudflare.com and click **Sign Up**
2. Enter your email and create a password
3. On the dashboard, click **Add a Site** and enter your domain name
4. Cloudflare will scan your DNS records automatically
5. Update your domain nameservers at your registrar to the ones Cloudflare provides
6. Once activated, go to **My Profile → API Tokens → Create Token**
7. Use the **Edit zone DNS** template and generate the token

### Credentials to Save
```
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
```

### Notes
- Free tier CDN is sufficient for most production workloads
- Cloudflare Zone ID is visible on the right side of your domain overview page
- CDN is mostly configured through the dashboard, credentials are only needed for programmatic DNS changes

---

## 12. Sentry — Error Monitoring

**Website:** https://sentry.io

### Steps
1. Go to sentry.io and click **Get Started**
2. Sign up with your email or GitHub
3. Create a new **Organization** with your project name
4. Click **Create Project**, select **Node.js** for backend and **React** for frontend
5. Sentry will display a **DSN** (Data Source Name) after project creation
6. Install the Sentry SDK in your project using the command shown in the setup wizard

### Credentials to Save
```
# Backend
SENTRY_DSN_BACKEND=https://xxxx@xxxx.ingest.sentry.io/xxxx

# Frontend
SENTRY_DSN_FRONTEND=https://xxxx@xxxx.ingest.sentry.io/xxxx
```

### Notes
- Free tier allows 5,000 errors per month which is plenty for development and early launch
- Create two separate Sentry projects — one for Node.js backend, one for React frontend
- Sentry also provides performance monitoring and session replay on the free tier

---

## 13. Storing Credentials Safely

### Local Development

Create a `.env` file in the root of both your frontend and backend projects:

```
# .env (Backend - Node.js)

# Database
DATABASE_URL=postgresql://...
   
# Auth
JWT_SECRET=your_very_long_random_secret_string

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# JazzCash
JAZZCASH_MERCHANT_ID=...
JAZZCASH_PASSWORD=...
JAZZCASH_INTEGRITY_SALT=...

# Easypaisa
EASYPAISA_STORE_ID=...
EASYPAISA_HASH_KEY=...

# OpenAI
OPENAI_API_KEY=sk-...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Sentry
SENTRY_DSN_BACKEND=https://...
```

### Critical Rules

- **Never commit `.env` to GitHub** — add `.env` to your `.gitignore` file immediately
- **Never hardcode any key in your source code** — always use `process.env.KEY_NAME`
- **Use different keys for development and production** — most services provide separate test and live credentials
- **Rotate any key immediately** if it is ever accidentally exposed in a commit or message

### For Production Deployment

Add all environment variables directly in:
- **Railway dashboard** → Service → Variables (for backend)
- **Vercel dashboard** → Project Settings → Environment Variables (for frontend)

This way your keys are never stored in code or exposed publicly.

---

*Document prepared for IndusAI Technology E-Commerce Platform — Version 1.0*
