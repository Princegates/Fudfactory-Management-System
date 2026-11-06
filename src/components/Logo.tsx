/**
 * Generic brand mark: renders the vendor's uploaded logo image if one is
 * set in Settings → Website, otherwise falls back to a styled text
 * wordmark built from their business name — so every new vendor gets a
 * working logo with zero asset work, and can swap in their own art later.
 *
 * On the public site (`themed` — the default), the text wordmark recolors
 * per site theme and day/night mode via CSS custom properties. The staff
 * portal has no theme system, so it renders with a fixed brand color
 * instead — pass `themed={false}`.
 */
export function Logo({
  className = "h-8",
  themed = true,
  name = "Your Business",
  logoUrl,
}: {
  className?: string;
  themed?: boolean;
  name?: string;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="h-full w-auto object-contain" />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-display font-bold leading-none tracking-tight ${className}`}
      style={{ color: themed ? "var(--glow-amber)" : "#c1440e", fontSize: "1em" }}
    >
      {name}
    </span>
  );
}

/** Compact icon-only mark for tight spaces (mobile badges, avatars). Uses
 * the uploaded logo image if set, otherwise a circular badge with the
 * business name's initial. */
export function LogoMark({
  className = "h-9 w-9",
  name = "Your Business",
  logoUrl,
}: {
  className?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  if (logoUrl) {
    return (
      <span className={`relative inline-block overflow-hidden rounded-lg ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
      </span>
    );
  }

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-display font-bold ${className}`}
      style={{ backgroundColor: "var(--ink-900)", color: "var(--glow-amber)" }}
      role="img"
      aria-label={name}
    >
      {initial}
    </span>
  );
}
