const CATEGORY_ICON: Record<string, string> = {
  Cakes: "🎂",
  Pastries: "🥐",
  Snacks: "🍩",
  "Main Meals": "🍛",
  Drinks: "🥤",
  Breakfast: "🍳",
  "Event Packages": "🎉",
  "Special Orders": "✨",
};

const VARIANTS = [
  { a: "var(--glow-amber)", b: "var(--glow-cyan)" },
  { a: "var(--glow-cyan)", b: "var(--glow-amber-strong)" },
  { a: "var(--glow-amber-strong)", b: "var(--glow-amber)" },
  { a: "var(--glow-cyan)", b: "var(--glow-amber)" },
  { a: "var(--glow-amber-strong)", b: "var(--glow-cyan)" },
];

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function ProductArt({
  name,
  category,
  className = "",
  iconClassName = "text-6xl",
}: {
  name: string;
  category?: string;
  className?: string;
  iconClassName?: string;
}) {
  const icon = (category && CATEGORY_ICON[category]) || "🧁";
  const variant = VARIANTS[hashString(name) % VARIANTS.length];
  const angle = hashString(name + "angle") % 360;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-ink-900 ${className}`}>
      <div
        className="absolute -inset-6 opacity-60 blur-2xl"
        style={{
          background: `conic-gradient(from ${angle}deg, ${variant.a}, transparent 35%, ${variant.b}, transparent 75%, ${variant.a})`,
        }}
      />
      <div className="bg-grid absolute inset-0 opacity-40" />
      <span
        className={`relative ${iconClassName}`}
        style={{ filter: `drop-shadow(0 0 24px color-mix(in srgb, ${variant.a} 45%, transparent))` }}
        aria-hidden
      >
        {icon}
      </span>
    </div>
  );
}
