# FudFactory Management System

A full-stack web platform for **FudFactory** (Instagram: [@fudfactory.gh](https://instagram.com/fudfactory.gh)) — a food, pastry and catering business. It combines a public ordering website with an internal business management portal (POS, inventory, production, CRM, finance, marketing and reporting), built from the project's Software Requirements Specification.

## Tech stack

- **Framework**: Next.js 16 (App Router, TypeScript, Route Handlers as the API layer)
- **Styling**: Tailwind CSS v4
- **Database/ORM**: Prisma 6 + SQLite for local development (swap the `datasource` provider to `postgresql`/`mysql` for production — the schema is written to be provider-agnostic)
- **Auth**: Custom JWT sessions in httpOnly cookies — separate sessions for staff (`/portal`) and customers (`/account`)
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

### Route map

- `src/app/(site)/*` — public website: home, menu, product details, cart/checkout, gallery, promotions, custom/event order quotations, contact, customer account & order tracking.
- `src/app/portal/*` — staff portal, gated by `src/proxy.ts` (Next's renamed Middleware) and role checks in `src/lib/permissions.ts` / `src/lib/session.ts`. Each module (POS, Orders, Inventory, Recipes, Production, Deliveries, Payments, Expenses, Quotations, Promotions, Loyalty, Reports, Reviews, Staff, Settings, Audit Log) is a separate route restricted to the roles defined in the SRS (§4).
- `src/app/api/*` — Route Handlers backing both the site and portal.
- `prisma/schema.prisma` — the full data model (SRS §32): Users, Customers, Categories, Products, Suppliers, Inventory (raw materials + finished goods) with a full transaction ledger, Recipes/BOM, Production, Orders/Payments/Deliveries, Expenses, Promotions, Loyalty, Notifications, Reviews, Quotations, Business Settings and an Audit Log.

## Phased delivery vs. the SRS roadmap (§47)

| Phase | Status |
|---|---|
| 1 — Website, POS, Products, Orders, Customers, Inventory | ✅ Built |
| 2 — Recipes, Production, Suppliers, Delivery, Expenses | ✅ Built |
| 3 — CRM, Loyalty, Promotions | ✅ Built (SMS/Email/WhatsApp are simulated — see below) |
| 4 — Advanced analytics / forecasting | ◐ Partial — Reports & Analytics page covers revenue, product performance, channel mix and CSV export; predictive forecasting is not implemented |
| 5 — Mobile apps | ✗ Not built — the API-driven Route Handler layer is ready to serve a future mobile client |

## Known simplifications (documented, not hidden)

- **Payments** are simulated: there's no live Mobile Money/card gateway integration. Cash orders start `PENDING`; other methods are marked `SUCCESSFUL` immediately. Swapping in a real gateway means replacing the payment-status logic in `src/lib/orders.ts`.
- **Notifications** (order-received SMS/WhatsApp) are recorded in the `Notification` table but not actually dispatched — there's no SMS/WhatsApp Business API credential wired up. The "Contact Us" form instead opens a pre-filled WhatsApp chat link, which needs no backend.
- **Reports** export as CSV (`/portal/reports`); PDF/Excel formats mentioned in the SRS aren't implemented.
- **Delivery fees** are a flat rate rather than zone-based pricing.
- Employees are modeled as `User` records with HR fields (department, employment status) rather than a separate `Employee` table, since every staff member also needs portal login.
- Promotions support percentage and fixed-amount discounts automatically at checkout; BOGO/combo offers are recorded but applied manually by staff.

## Security notes

- Passwords are hashed with bcrypt; sessions are JWTs in httpOnly, `sameSite=lax` cookies.
- `src/proxy.ts` does a cheap cookie-presence check on `/portal/*`; every portal page additionally calls `requireStaff([...roles])` server-side, which is the actual authorization boundary.
- All prices are recalculated server-side from the database at checkout — client-submitted prices are never trusted.
- Set a strong `JWT_SECRET` before deploying anywhere beyond local development.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run lint` — ESLint
- `npm run db:migrate` — apply Prisma migrations
- `npm run db:seed` — load demo data
- `npm run db:studio` — Prisma Studio (browse the database)
