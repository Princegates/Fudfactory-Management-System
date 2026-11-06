-- Add logoUrl so vendors can upload their own logo instead of relying on
-- fixed brand artwork, and switch the column defaults away from
-- FudFactory-specific placeholder text now that this is a generic template.
ALTER TABLE "BusinessProfile" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "BusinessProfile" ALTER COLUMN "businessName" SET DEFAULT 'Your Business Name';
ALTER TABLE "BusinessProfile" ALTER COLUMN "tagline" SET DEFAULT 'Add your tagline in Settings';
ALTER TABLE "BusinessProfile" ALTER COLUMN "instagramHandle" SET DEFAULT 'yourbusiness';
