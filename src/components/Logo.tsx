/**
 * FudFactory's real logo, cropped from the artwork the business supplied
 * (public/logo-wordmark.png / public/logo-icon.png) — fixed brand colors,
 * shown as-is rather than recolored per site theme or night/day mode.
 */
export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wordmark.png" alt="FudFactory" className="brand-logo-day h-full w-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-wordmark-night.png" alt="FudFactory" className="brand-logo-night h-full w-auto" />
    </span>
  );
}

/** Compact icon-only mark for tight spaces (mobile badges, avatars). */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo-icon.png" alt="FudFactory" className={`rounded-lg object-contain ${className}`} />
  );
}
