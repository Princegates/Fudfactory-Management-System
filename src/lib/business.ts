import { prisma } from "./prisma";

const DEFAULTS = {
  businessName: "FudFactory",
  tagline: "Fresh Bakes, Delivered Daily",
  phone: "+233 20 000 0000",
  whatsapp: "+233 20 000 0000",
  email: "hello@fudfactory.gh",
  address: "Accra, Ghana",
  instagramHandle: "fudfactory.gh",
  facebookUrl: null as string | null,
  aboutText: null as string | null,
  heroImageUrl: null as string | null,
};

export async function getBusinessProfile() {
  const profile = await prisma.businessProfile.findUnique({ where: { id: "default" } });
  return {
    businessName: profile?.businessName ?? DEFAULTS.businessName,
    tagline: profile?.tagline ?? DEFAULTS.tagline,
    phone: profile?.phone ?? DEFAULTS.phone,
    whatsapp: profile?.whatsapp ?? DEFAULTS.whatsapp,
    email: profile?.email ?? DEFAULTS.email,
    address: profile?.address ?? DEFAULTS.address,
    instagramHandle: profile?.instagramHandle ?? DEFAULTS.instagramHandle,
    facebookUrl: profile?.facebookUrl ?? DEFAULTS.facebookUrl,
    aboutText: profile?.aboutText ?? DEFAULTS.aboutText,
    heroImageUrl: profile?.heroImageUrl ?? DEFAULTS.heroImageUrl,
  };
}
