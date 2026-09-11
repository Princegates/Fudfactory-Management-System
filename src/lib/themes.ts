export type SiteTheme = {
  slug: string;
  name: string;
  description: string;
  swatch: { ink: string; amber: string; amberStrong: string; cyan: string };
};

export const SITE_THEMES: SiteTheme[] = [
  {
    slug: "amber-glow",
    name: "Signature",
    description: "The default — FudFactory's real brand maroon, with a gold accent.",
    swatch: { ink: "#221419", amber: "#8c1f3a", amberStrong: "#6b1228", cyan: "#c98a3d" },
  },
  {
    slug: "neon-sunset",
    name: "Plum",
    description: "Muted plum with a mustard accent.",
    swatch: { ink: "#22161d", amber: "#7c3a5d", amberStrong: "#5c2a45", cyan: "#c98a3d" },
  },
  {
    slug: "cyber-lime",
    name: "Olive",
    description: "Earthy olive with a rust accent.",
    swatch: { ink: "#1b1f14", amber: "#5c6b2e", amberStrong: "#444f20", cyan: "#a6371f" },
  },
  {
    slug: "ocean-depths",
    name: "Denim Ink",
    description: "Cool denim blue with a terracotta accent.",
    swatch: { ink: "#151d24", amber: "#35597a", amberStrong: "#244059", cyan: "#c1440e" },
  },
  {
    slug: "royal-violet",
    name: "Aubergine",
    description: "Deep aubergine with a mustard accent.",
    swatch: { ink: "#201824", amber: "#5b3868", amberStrong: "#402649", cyan: "#c98a3d" },
  },
  {
    slug: "ruby-fire",
    name: "Rust",
    description: "Bold rust red — bakery warmth, editorial restraint.",
    swatch: { ink: "#251913", amber: "#a6371f", amberStrong: "#7c2916", cyan: "#35597a" },
  },
  {
    slug: "emerald-circuit",
    name: "Forest",
    description: "Deep forest green with a rust accent.",
    swatch: { ink: "#16211a", amber: "#3f6b45", amberStrong: "#2d4e32", cyan: "#a6371f" },
  },
  {
    slug: "electric-blue",
    name: "Cobalt",
    description: "Confident cobalt blue with a terracotta accent.",
    swatch: { ink: "#151b25", amber: "#2c4f8c", amberStrong: "#1f3a68", cyan: "#c1440e" },
  },
  {
    slug: "rose-gold",
    name: "Clay Pink",
    description: "Soft clay pink with an olive accent.",
    swatch: { ink: "#25181b", amber: "#b5657a", amberStrong: "#8c4a5c", cyan: "#5c6b2e" },
  },
  {
    slug: "solar-flare",
    name: "Mustard",
    description: "Warm mustard gold with a plum accent.",
    swatch: { ink: "#241e14", amber: "#b9822c", amberStrong: "#8c611e", cyan: "#7c3a5d" },
  },
  {
    slug: "arctic-frost",
    name: "Slate Teal",
    description: "Cool slate teal with a rust accent.",
    swatch: { ink: "#151f1f", amber: "#3c6e6b", amberStrong: "#2a4e4c", cyan: "#a6371f" },
  },
  {
    slug: "midnight-mint",
    name: "Sage",
    description: "Muted sage green with a plum accent.",
    swatch: { ink: "#19221c", amber: "#4f7a5e", amberStrong: "#395a45", cyan: "#7c3a5d" },
  },
];

export const DEFAULT_SITE_THEME = "amber-glow";

export function isValidSiteTheme(slug: string): boolean {
  return SITE_THEMES.some((t) => t.slug === slug);
}
