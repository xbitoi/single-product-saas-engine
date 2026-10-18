<div align="center"><a href="README.ar.md">العربية</a> &nbsp;|&nbsp; <b>English</b></div>

# Single Product SaaS Engine

A complete single-product sales platform: dynamic landing page, PayPal checkout, AI sales chatbot, product scraper, order management, Telegram alerts, and an owner dashboard with theme and language switching.

## Features

### Storefront

- Dynamic, database-driven landing page (title, price, compare-at price, images, description, features, story, closing CTA)
- Collection grid linking to individual product detail pages (`/product/[id]`)
- Checkout modal with embedded PayPal buttons (server-side order creation and capture)
- Floating AI sales chatbot that reads the current product as its system prompt
- Theme toggle (dark / light) persisted to localStorage
- Language switcher (English / Arabic) with RTL layout support
- Trust band, reviews, FAQ, and guarantee sections

### Owner Dashboard (`/dashboard`)

- Overview: revenue, order counts, recent orders, active product snapshot
- Product Scraper: paste any product URL, extract title / price / images / description / features, edit with live preview, publish
- Product Library: re-feature, hide, or delete previous products
- Orders: searchable, filterable table with status workflow (PAID / SHIPPED / COMPLETED / CANCELLED)
- Telegram Bot: store bot token + chat id, test the connection, view live bot status
- Payments: manage PayPal client id / secret / mode, verify credentials, clear stored keys
- Chatbot Settings: enable/disable, choose Gemini or OpenAI, set API key, model, tone, and system prompt
- Settings: toggle auth protection, set default language, change or reset the owner password

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15.1.6 (App Router), React 19, Tailwind CSS 3.4, Framer Motion 11, Lucide React |
| Backend | Next.js Server Actions + Route Handlers (Node.js runtime) |
| Database | PostgreSQL via Prisma ORM 6.2 |
| Embedded DB | PGlite 0.5 (in-process PostgreSQL for local preview) |
| Payments | PayPal REST API (server-side create + capture), `@paypal/react-paypal-js` 8.8 |
| AI | Google Gemini (`@google/generative-ai` 0.21) or OpenAI (`openai` 4.79) |
| Scraping | `cheerio` 1.0 (static), `playwright` 1.49 (headless Chromium fallback) |
| Notifications | Telegram Bot API |
| Validation | Zod 3.24 |
| Auth | `jose` 5.9 (JWT HS256 session cookie), scrypt password hashing |
| Styling | Tailwind CSS, `clsx`, `tailwind-merge` |

## Quick Start - Windows (One-Click)

Run `install.bat` once to set up the project:

```bat
install.bat
```

This script will:

1. Check for Node.js and npm (offers to install Node.js LTS via winget if missing)
2. Create `.env` from `.env.example` if it does not exist
3. Stop any running instance of the app (to avoid file locks on Windows)
4. Run `npm install` (with one retry on failure)
5. Generate the Prisma client
6. Prepare the local PGlite database (schema + demo data)
7. Optionally install Playwright Chromium for scraping JS-heavy stores

Then start the server:

```bat
start.bat
```

### start.bat Arguments

| Argument | Behaviour |
| --- | --- |
| *(none)* | Opens store + dashboard in the browser |
| `dashboard` | Opens only the dashboard |
| `store` | Opens only the store |
| `nobrowser` | Does not open the browser automatically |

### Port 3000 Already in Use

If port 3000 is occupied, `start.bat` detects the process and offers three choices:

- **O** (Open): Opens the existing instance in the browser and exits
- **K** (Kill): Stops the occupying process and starts a fresh server on port 3000
- **N** (New port): Starts on port 3001 instead (warning: two servers may conflict over the local database)

## Quick Start - Manual (Cross-Platform)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env      # then fill in the values

# 3. Set up the database
npx prisma db push          # or: npx prisma migrate dev
npm run db:seed             # optional sample product

# 4. Run
npm run dev                 # http://localhost:3000
```

## Environment Variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Yes (unless using PGlite) |
| `APP_URL` | Base URL of the app (used for callbacks) | No (defaults to `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public base URL exposed to client components | No |
| `ADMIN_PASSWORD` | Dashboard login password (fallback if no hash stored in DB) | Recommended |
| `SESSION_SECRET` | 32+ random characters for signing the session JWT | Recommended |
| `PAYPAL_ENV` | `sandbox` or `live` | No (defaults to `sandbox`) |
| `NEXT_PUBLIC_PAYPAL_ENV` | PayPal environment exposed to client | No |
| `PAYPAL_CLIENT_ID` | PayPal REST app client id (env fallback) | Yes (for checkout) |
| `PAYPAL_CLIENT_SECRET` | PayPal REST app client secret (env fallback, server-only) | Yes (for checkout) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client id exposed to client for button rendering | Yes (for checkout) |
| `PAYPAL_CURRENCY` | ISO 4217 currency code | No (defaults to `USD`) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (env fallback, server-only) | No |
| `TELEGRAM_CHAT_ID` | Telegram chat id for order alerts (env fallback) | No |
| `AI_PROVIDER` | `gemini` or `openai` | No (defaults to `gemini`) |
| `GEMINI_API_KEY` | Google Gemini API key (env fallback) | For chatbot |
| `OPENAI_API_KEY` | OpenAI API key (env fallback) | For chatbot |
| `AI_MODEL` | Override the default AI model | No |
| `USE_PGLITE` | Set to `1` to use the embedded PGlite database | No (defaults to off) |
| `PGLITE_DIR` | Directory for PGlite data files | No (defaults to `./.pglite`) |

AI keys and PayPal credentials can also be set from the dashboard and are stored in the database. Environment values serve as fallbacks.

## Local Development Database (PGlite)

The app can run against an embedded PGlite PostgreSQL instance, so no external database server is needed for local development.

Set the following in your `.env`:

```env
USE_PGLITE=1
PGLITE_DIR=./.pglite
```

### Helper Scripts

| Script | Purpose |
| --- | --- |
| `node scripts/preview-db.mjs` | Creates the PGlite schema and seeds a demo product plus sample orders. Idempotent. |
| `node scripts/pglite-repair.mjs` | Removes a stale `postmaster.pid` lock after a hard kill. Run before starting the dev server if you see `RuntimeError: Aborted()`. |
| `node scripts/preview-reset.mjs` | Deletes the entire PGlite directory and rebuilds it from scratch. Use when the data directory is corrupted. |

Only one process may use the PGlite directory at a time. Running two dev servers concurrently against the same directory will cause conflicts.

### Playwright Browsers (Optional)

The scraper falls back to a headless Chromium browser for JS-heavy stores. Static stores work without it.

```bash
npx playwright install chromium
```

## Dashboard Access

The dashboard lives at `/dashboard`. An unauthenticated visit is redirected to `/login`.

The password is resolved in this order:

1. The scrypt hash stored in the database (set via Dashboard > Settings)
2. The `ADMIN_PASSWORD` environment variable (fallback)

Auth protection can be disabled entirely from Dashboard > Settings by toggling off the "Require password" option. When disabled, all dashboard pages and API routes are accessible without a login.

## Project Structure

```
single-product-saas-engine/
  prisma/
    schema.prisma            # Product, Order, OrderStatus, Setting models
    pglite-init.sql          # DDL for the embedded PGlite database
    seed.ts                  # npm run db:seed sample product
  scripts/
    preview-db.mjs           # PGlite schema + demo data bootstrap
    pglite-repair.mjs        # Stale lock cleanup after hard kill
    preview-reset.mjs        # Full PGlite wipe and rebuild
  src/
    app/
      page.tsx               # Landing page
      product/[id]/          # Product detail page
      login/                 # Login page + actions
      dashboard/
        page.tsx             # Overview
        products/            # Product scraper + library
        orders/              # Order management table
        telegram/            # Telegram bot settings
        chatbot/             # AI chatbot settings
        payments/            # PayPal credentials
        settings/            # Auth, language, password
        actions.ts           # Server actions for all dashboard modules
      api/
        chat/                # POST /api/chat (AI assistant)
        checkout/
          create/            # POST /api/checkout/create
          capture/            # POST /api/checkout/capture
        scraper/             # POST /api/scraper (product extraction)
        admin/
          telegram-test/     # POST /api/admin/telegram-test
          paypal-verify/     # POST /api/admin/paypal-verify
          upload/            # POST /api/admin/upload (image upload)
    components/
      landing/               # Landing page sections
      chat/                  # ChatWidget
      dashboard/             # Dashboard forms and tables
      auth/                  # LoginForm
      i18n/                  # LanguageProvider, LanguageSwitcher, ThemeToggle
      ui/                    # NoticeProvider
    lib/
      prisma.ts              # Prisma client (PGlite or standard)
      env.ts                 # Zod-validated environment variables
      session.ts             # JWT sign / verify (jose)
      auth.ts                # Auth guards and password verification
      password.ts            # scrypt hash / verify
      paypal.ts              # PayPal REST API helpers
      telegram.ts            # Telegram Bot API helpers
      ai.ts                  # Gemini + OpenAI chat generation
      scraper.ts             # cheerio + playwright product scraper
      validators.ts          # Zod schemas for all inputs
      data.ts                # Product / order query helpers
      settings.ts            # Singleton settings row CRUD
      i18n/                  # English + Arabic dictionaries
      utils.ts               # Formatting and utility functions
  install.bat                # Windows one-click installer
  start.bat                  # Windows dev server launcher
```

## Workflow

```
Owner pastes a product URL in the dashboard
  -> scraper extracts title, price, images, description, features
  -> owner edits the draft and sees a live preview
  -> owner publishes (previous product is saved to the collection)
  -> landing page and chatbot update immediately
  -> visitor browses the store, chats with the AI assistant
  -> visitor checks out via PayPal
  -> order is saved (idempotent capture by paypalOrderId)
  -> Telegram alert is sent instantly with order details
  -> owner manages orders from the dashboard
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:migrate` | Run Prisma migrations in development |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed a sample product (skips if products exist) |

## Security Notes

- **Server-side price reads**: The checkout capture route reads the product price from the database, never trusting the client-submitted amount.
- **Idempotent order capture**: Duplicate captures for the same `paypalOrderId` are detected and the existing order is returned without creating a second record.
- **httpOnly signed session cookie**: Sessions are JWTs (HS256) signed with `SESSION_SECRET`, stored in an `httpOnly` cookie with `sameSite=lax` and a 7-day expiry. The cookie is `secure` in production.
- **Secrets stay server-side**: PayPal client secret, AI API keys, and Telegram bot tokens are never sent to the client. Only `NEXT_PUBLIC_*` variables are exposed.
- **Password hashing**: The dashboard password is hashed with scrypt before storage in the database.
- **Auth toggle**: The owner can disable dashboard authentication entirely from Settings. When disabled, `requireAdmin()` returns a synthetic admin session without checking credentials.
- **Input validation**: All server actions and API routes validate input with Zod schemas before processing.
- **Image upload restrictions**: The upload endpoint enforces a 5 MB size limit and allows only JPG, PNG, WEBP, GIF, and AVIF formats.

## License

Not specified.
