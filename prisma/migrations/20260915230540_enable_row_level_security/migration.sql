-- Enables Row Level Security on every table in the public schema.
--
-- Why: Supabase auto-exposes every public-schema table through its REST API
-- (PostgREST) using the anon/authenticated keys. With RLS disabled, anyone
-- holding the anon key (often embedded client-side, meant to be safe only
-- because RLS is supposed to restrict it) can read and write every row in
-- every table below directly, bypassing this app entirely.
--
-- Why this is safe to run: this app's Prisma connection uses the `postgres`
-- role, which owns these tables and always bypasses RLS — enabling RLS here
-- does not affect any query this app makes. It only blocks the `anon` and
-- `authenticated` PostgREST roles, which end up with zero policies granting
-- them anything, so they get "permission denied" / no rows instead of full
-- access. Nothing else needs to change.
--
-- Safe to run once. Re-running is harmless (ENABLE ROW LEVEL SECURITY is
-- idempotent).

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BusinessProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Setting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InventoryItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InventoryTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Recipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecipeItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductionOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProductionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."LoyaltyTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Quotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditLog" ENABLE ROW LEVEL SECURITY;
