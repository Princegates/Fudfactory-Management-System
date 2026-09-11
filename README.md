# FudFactory Management System

A full-stack web platform for **FudFactory** (Instagram: [@fudfactory.gh](https://instagram.com/fudfactory.gh)) — a food, pastry, catering and event-planning business. It combines a public ordering website with an internal business management portal (POS, inventory, production, CRM, finance, marketing, payments and reporting), built from the project's Software Requirements Specification.

## Tech stack

- **Framework**: Next.js 16 (App Router, TypeScript, Route Handlers as the API layer)
- **Styling**: Tailwind CSS v4 — the public site uses a bold, editorial design system (Fraunces display serif + Inter body, asymmetrical glassmorphic layouts, organic blob shapes, tangerine/magenta/violet gradient accents) with a night/day mode toggle and 12 selectable color themes; the staff portal keeps a calm, functional light UI
- **Database/ORM**: Prisma 6 + SQLite for local development (swap the `datasource` provider to `postgresql`/`mysql` for production — the schema is written to be provider-agnostic)
- **Auth**: Custom JWT sessions in httpOnly cookies — separate sessions for staff (`/portal`) and customers (`/account`)
- **Payments**: Real Paystack and Hubtel gateway integrations, plus a manual "pay to our own Mobile Money number" flow verified by transaction ID
- **Animation**: `motion` for scroll-reveal and micro-interactions
- **Charts**: Recharts

This matches the stack recommended in the SRS (§43): React/Next.js + Tailwind, a Node.js backend, and a relational database behind an API-driven architecture.

## Getting started

```bash
npm install
cp .env.example .env          # then edit JWT_SECRET for anything beyond local dev
npm run db:migrate             # applies the Prisma schema (creates dev.db)
npm run db:seed                # loads demo data (see accounts below)
npm run dev
```

`db:migrate` (Prisma's `migrate dev`) already runs the seed script itself the first time it creates `dev.db`, so running `db:seed` right after is often a no-op re-run — that's expected and safe. `npm run db:seed` clears and reloads all demo data every time it runs, so re-run it any time you want to reset the database back to the demo dataset below.

Visit `http://localhost:3000` for the public site and `http://localhost:3000/portal/login` for the staff portal.

### Demo accounts (from `npm run db:seed`)

All staff accounts share the password **`Password123!`**:

| Role | Email |
|---|---|
| Super Administrator | admin@fudfactory.gh |
| Owner / Manager | owner@fudfactory.gh |
| Cashier | cashier@fudfactory.gh |
| Inventory Officer | inventory@fudfactory.gh |
| Production Officer | production@fudfactory.gh |
| Delivery Officer | delivery@fudfactory.gh |

Demo customer: phone `+233501234567`, password `Password123!`.

## Architecture

```
Public Website  ─┐
                  ├─► Next.js Route Handlers (API) ─► Prisma ─► SQLite/Postgres
Business Portal ─┘
```

One database, one source of truth (SRS §49): placing an online order or ringing up a POS sale updates Orders, Payments, Inventory, Customer history and reporting figures in the same transaction. See `src/lib/orders.ts`, `src/lib/sales.ts`, `src/lib/production.ts` and `src/lib/inventory.ts` for the business-rule implementations:

- A completed sale (POS or online) deducts finished-goods inventory immediately.
- Completing a production order consumes the recipe's raw materials and increases finished-goods stock, calculating estimated cost (ingredients + labor + packaging + overhead) and implied gross profit.
- Cancelling, rejecting or refunding an order reverses any inventory it had deducted.
- Completing an order awards loyalty points and updates the customer's lifetime spend and segment (NEW → REGULAR → VIP).
- A payment gateway (Paystack/Hubtel) order stays `PENDING` until the gateway confirms via webhook — `src/lib/orders.ts#finalizeGatewayPayment` handles that transition, completing the order (POS) or confirming it (online) once payment is real.
- Every other **manual** payment method (cash on delivery, direct Mobile Money transfer, bank transfer) placed **online** also stays `PENDING` — staff verify the transaction reference against their bank/MoMo statement and confirm it from the Payments screen. POS sales remain instant, since the cashier is physically present to confirm payment on the spot.

### Route map

- `src/app/(site)/*` — public website: home, menu, product details, cart/checkout, gallery, promotions, custom/event order & full event-planning quotations, contact, customer account & order tracking.
- `src/app/portal/*` — staff portal, gated by `src/proxy.ts` (Next's renamed Middleware) and role checks in `src/lib/permissions.ts` / `src/lib/session.ts`. Each module (POS, Orders, Inventory, Recipes, Production, Deliveries, Payments, Expenses, Quotations, Promotions, Loyalty, Reports, Reviews, Staff, System Settings, Audit Log) is a separate route restricted to the roles defined in the SRS (§4).
- `src/app/portal/(dashboard)/settings/*` — System Settings, with its own sub-navigation: General, Payment Methods, Notifications, WhatsApp Messaging, SMS, Email, Print/Receipts, Website (Front CMS), Themes, Roles & Permissions (reference), Currency, Backup & Restore.
- `src/app/api/*` — Route Handlers backing both the site and portal, including `api/payments/*` for gateway initialize/charge/callback/webhook routes.
- `prisma/schema.prisma` — the full data model (SRS §32): Users, Customers, Categories, Products, Suppliers, Inventory (raw materials + finished goods) with a full transaction ledger, Recipes/BOM, Production, Orders/Payments (with gateway fields)/Deliveries, Expenses, Promotions, Loyalty, Notifications, Reviews, Quotations, a generic `Setting` key-value store, Business Settings and an Audit Log.

## Payments

Configured entirely from **Settings → Payment Methods** (Super Admin only) — no redeploy needed:

- **Paystack** — hosted checkout (card + Mobile Money) for online orders. Configure the public/secret key, then set your Paystack webhook to `<your-domain>/api/payments/paystack/webhook` and the dashboard callback to `<your-domain>/api/payments/paystack/callback`.
- **Hubtel** — a direct Mobile Money charge (MTN, Telecel, AirtelTigo) that prompts the customer's phone for a PIN, used in the **POS**; and a hosted checkout for online orders. Configure the merchant account number, client ID and client secret, then point Hubtel's callback at `<your-domain>/api/payments/hubtel/callback`.
- **Direct Mobile Money (manual)** — the simplest option: display your own MoMo number and instructions at checkout; the customer pays you directly (no gateway fees) and enters the transaction ID, which staff cross-check against their MoMo statement before confirming the payment on the Payments screen.
- **Cash, Card (manual) and Bank Transfer** always work with no configuration, recorded and confirmed by staff the same way.

`src/lib/payments/paystack.ts` and `src/lib/payments/hubtel.ts` isolate the gateway HTTP calls. **Important caveat**: this project was built in a sandboxed environment whose network egress is blocked to `paystack.co` and `hubtel.com`, so neither integration could be live-tested against the real APIs. The Paystack implementation follows Paystack's stable, well-documented REST API closely. The Hubtel implementation follows Hubtel's published Online Checkout / Receive Money API shapes as documented at the time of writing — **verify the endpoint paths and payload fields against Hubtel's current developer portal and test with real sandbox credentials before going live**; every call surfaces Hubtel's raw error response to make any mismatch easy to diagnose.

## Themes and night/day mode

Settings → Themes lets a Super Admin instantly switch the public site's whole color palette (12 options: Amber Glow, Neon Sunset, Cyber Lime, Ocean Depths, Royal Violet, Ruby Fire, Emerald Circuit, Electric Blue, Rose Gold, Solar Flare, Arctic Frost, Midnight Mint) with no code changes or redeploy — see `src/lib/themes.ts` and the `[data-site-theme]` blocks in `src/app/globals.css`.

Independently, every visitor can flip the site between night (dark) and day (light) mode with the sun/moon switch in the header (`src/components/site/ModeToggle.tsx`). The choice is stored in a `ff_site_mode` cookie and read server-side in `src/app/(site)/layout.tsx`, so the correct palette renders on the very first request — no flash of the wrong mode. Each of the 12 themes ships both a night and a day surface palette (`[data-mode="light"]` overrides in `globals.css`) built from the same CSS custom properties (`--ink-*`, `--text-*`, `--glow-*`) every site page already consumes, so the whole public site — not just the homepage — respects both the chosen accent theme and the chosen mode.

## Phased delivery vs. the SRS roadmap (§47)

| Phase | Status |
|---|---|
| 1 — Website, POS, Products, Orders, Customers, Inventory | ✅ Built |
| 2 — Recipes, Production, Suppliers, Delivery, Expenses | ✅ Built |
| 3 — CRM, Loyalty, Promotions | ✅ Built (SMS/Email/WhatsApp dispatch is not wired to a live provider — see below; payments are real, see above) |
| 4 — Advanced analytics / forecasting | ◐ Partial — Reports & Analytics page covers revenue, product performance, channel mix and CSV export; predictive forecasting is not implemented |
| 5 — Mobile apps | ✗ Not built — the API-driven Route Handler layer is ready to serve a future mobile client |

## Known simplifications (documented, not hidden)

- **Notification dispatch**: Settings → Notifications/SMS/Email/WhatsApp store provider configuration (and a `Notification` row is created for order events), but no SMS/email/WhatsApp is actually sent yet — wiring an actual provider call is the next step once you have live credentials. The "Contact Us" form instead opens a pre-filled WhatsApp chat link, which needs no backend.
- **Reports** export as CSV (`/portal/reports`); PDF/Excel formats mentioned in the SRS aren't implemented.
- **Delivery fees** are a flat rate rather than zone-based pricing.
- **Backup & Restore**: export to JSON works; restoring from a backup file isn't implemented (re-importing safely needs more validation than a simple upload) — restore at the database level with a developer's help if ever needed.
- Employees are modeled as `User` records with HR fields (department, employment status) rather than a separate `Employee` table, since every staff member also needs portal login.
- Promotions support percentage and fixed-amount discounts automatically at checkout; BOGO/combo offers are recorded but applied manually by staff.
- Product/category photos are generative gradient art (`src/components/site/ProductArt.tsx`) rather than real photography — this environment's network egress is blocked to Instagram and the business's live site, so no real photos could be fetched. Add real photos any time via the image-URL fields already in the portal (Products, Settings → Website).

## Security notes

- Passwords are hashed with bcrypt; sessions are JWTs in httpOnly, `sameSite=lax` cookies.
- `src/proxy.ts` does a cheap cookie-presence check on `/portal/*`; every portal page additionally calls `requireStaff([...roles])` server-side, which is the actual authorization boundary.
- All prices are recalculated server-side from the database at checkout — client-submitted prices are never trusted.
- Payment gateway secret keys are stored in the database (Settings → Payment Methods, Super Admin only) and masked in the UI once set; the Paystack webhook is signature-verified (`x-paystack-signature`, HMAC-SHA512).
- Set a strong `JWT_SECRET` before deploying anywhere beyond local development.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run lint` — ESLint
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — load demo data
- `npm run db:studio` — Prisma Studio (browse the database)
