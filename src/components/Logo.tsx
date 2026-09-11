import { Icon } from "./site/Icon";

/**
 * Recreates FudFactory's real wordmark — "Fud" + a covered-dish (cloche)
 * mark + "Factory" set inline — as scalable vector/text instead of a
 * bitmap, so it stays crisp and theme-reactive (accent-colored mark,
 * ink-colored text) across every color theme and both night/day modes.
 */
export function Logo({
  className = "",
  accentColor = "var(--glow-amber)",
}: {
  className?: string;
  accentColor?: string;
}) {
  return (
    <span className={`inline-flex items-center font-display font-bold ${className}`}>
      <span>Fud</span>
      <Icon name="cloche" className="mx-0.5 h-[0.9em] w-[0.9em] shrink-0 translate-y-[0.05em]" style={{ color: accentColor }} />
      <span>Factory</span>
    </span>
  );
}

/** Compact icon-only mark for tight spaces (mobile badges, avatars). */
export function LogoMark({
  className = "h-9 w-9",
  accentColor = "var(--glow-amber)",
}: {
  className?: string;
  accentColor?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg ${className}`}
      style={{ background: accentColor }}
    >
      <Icon name="cloche" className="h-[55%] w-[55%]" style={{ color: "#fdf8ef" }} />
    </span>
  );
}
