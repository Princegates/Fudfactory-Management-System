import { Icon, type IconName } from "./Icon";

const CATEGORY_ICON: Record<string, IconName> = {
  Cakes: "cake",
  Pastries: "pastry",
  Snacks: "donut",
  "Main Meals": "bowl",
  Drinks: "cup",
  Breakfast: "egg",
  "Event Packages": "event",
  "Special Orders": "sparkle",
};

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
  iconClassName = "h-14 w-14",
}: {
  name: string;
  category?: string;
  className?: string;
  iconClassName?: string;
}) {
  const icon = (category && CATEGORY_ICON[category]) || "sparkle";
  const angle = hashString(name + "angle") % 4;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border ${className}`}
      style={{ background: "var(--ink-900)", borderColor: "var(--ink-border)" }}
    >
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div
        className="absolute h-16 w-16 rounded-full border"
        style={{
          borderColor: "var(--ink-border-strong)",
          transform: `translate(${angle % 2 === 0 ? "-30%" : "30%"}, ${angle < 2 ? "-30%" : "30%"})`,
        }}
      />
      <Icon name={icon} className={`relative ${iconClassName}`} />
      <span className="sr-only">{name}</span>
    </div>
  );
}
