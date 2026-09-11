export type SiteTheme = {
  slug: string;
  name: string;
  description: string;
  swatch: { ink: string; amber: string; amberStrong: string; cyan: string };
};

export const SITE_THEMES: SiteTheme[] = [
  {
    slug: "amber-glow",
    name: "Amber Glow",
    description: "The default — warm amber & cyan on deep space black.",
    swatch: { ink: "#0a0c10", amber: "#ffb454", amberStrong: "#ff8a3d", cyan: "#35e6d3" },
  },
  {
    slug: "neon-sunset",
    name: "Neon Sunset",
    description: "Hot pink and violet over a deep purple night.",
    swatch: { ink: "#150a1c", amber: "#ff6ec7", amberStrong: "#ff2fb0", cyan: "#a78bfa" },
  },
  {
    slug: "cyber-lime",
    name: "Cyber Lime",
    description: "Acid green and magenta — maximum futuristic energy.",
    swatch: { ink: "#0a0f10", amber: "#baff3d", amberStrong: "#8cff00", cyan: "#ff3df0" },
  },
  {
    slug: "ocean-depths",
    name: "Ocean Depths",
    description: "Cool cyan and teal on deep navy.",
    swatch: { ink: "#071019", amber: "#35c7ff", amberStrong: "#0ea5e9", cyan: "#5eead4" },
  },
  {
    slug: "royal-violet",
    name: "Royal Violet",
    description: "Regal purple with a gold accent.",
    swatch: { ink: "#120d20", amber: "#c084fc", amberStrong: "#a855f7", cyan: "#fbbf24" },
  },
  {
    slug: "ruby-fire",
    name: "Ruby Fire",
    description: "Bold red and amber — bakery warmth turned up.",
    swatch: { ink: "#170a0b", amber: "#ff5470", amberStrong: "#e11d48", cyan: "#ffb454" },
  },
  {
    slug: "emerald-circuit",
    name: "Emerald Circuit",
    description: "Emerald and teal on a dark green base.",
    swatch: { ink: "#08130f", amber: "#34e89e", amberStrong: "#10b981", cyan: "#35e6d3" },
  },
  {
    slug: "electric-blue",
    name: "Electric Blue",
    description: "Deep blue with a bright sky-blue glow.",
    swatch: { ink: "#0a0f1c", amber: "#4d9fff", amberStrong: "#2563eb", cyan: "#7dd3fc" },
  },
  {
    slug: "rose-gold",
    name: "Rose Gold",
    description: "Soft rose and gold on a dark plum base.",
    swatch: { ink: "#180d10", amber: "#ffb4c6", amberStrong: "#fb7185", cyan: "#fbbf24" },
  },
  {
    slug: "solar-flare",
    name: "Solar Flare",
    description: "Sunset yellow, orange and pink on dark brown-black.",
    swatch: { ink: "#150e08", amber: "#ffd23f", amberStrong: "#ff6b35", cyan: "#ff206e" },
  },
  {
    slug: "arctic-frost",
    name: "Arctic Frost",
    description: "Icy blue on cool slate — crisp and clean.",
    swatch: { ink: "#0a1014", amber: "#7dd3fc", amberStrong: "#38bdf8", cyan: "#e0f2fe" },
  },
  {
    slug: "midnight-mint",
    name: "Midnight Mint",
    description: "Fresh mint green with a violet accent.",
    swatch: { ink: "#091210", amber: "#6ee7b7", amberStrong: "#34d399", cyan: "#c084fc" },
  },
];

export const DEFAULT_SITE_THEME = "amber-glow";

export function isValidSiteTheme(slug: string): boolean {
  return SITE_THEMES.some((t) => t.slug === slug);
}
