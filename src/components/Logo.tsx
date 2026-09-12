/**
 * FudFactory's real logo, cropped from the artwork the business supplied.
 *
 * On the public site (`themed` — the default), the wordmark/icon recolor
 * per site theme and day/night mode via CSS masking: the artwork is a
 * single- or two-tone shape with a transparent background, so a plain
 * `background-color` div can be cut into that shape with `mask-image` —
 * an exact recolor to any theme's tokens, no extra assets or JS needed,
 * and no day/night image swap since the tokens themselves already adapt.
 *
 * The staff portal has no theme system, so it renders the original fixed
 * brand-color artwork instead — pass `themed={false}`.
 */
export function Logo({ className = "h-8", themed = true }: { className?: string; themed?: boolean }) {
  if (!themed) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-wordmark.png" alt="FudFactory" className="h-full w-auto" />
      </span>
    );
  }

  return (
    <span
      className={`inline-block ${className}`}
      style={{
        aspectRatio: "1719 / 515",
        width: "auto",
        backgroundColor: "var(--glow-amber)",
        WebkitMaskImage: "url(/logo-wordmark.png)",
        maskImage: "url(/logo-wordmark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
      role="img"
      aria-label="FudFactory"
    />
  );
}

/** Compact icon-only mark for tight spaces (mobile badges, avatars). Two
 * layers reconstruct the badge's field + illustration from separate alpha
 * masks, each tinted with its own theme token. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  const maskLayer = (mask: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${mask})`,
    maskImage: `url(${mask})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  });

  return (
    <span className={`relative inline-block rounded-lg ${className}`} role="img" aria-label="FudFactory">
      <span
        className="absolute inset-0"
        style={{ backgroundColor: "var(--ink-900)", ...maskLayer("/logo-icon-mask-field.png") }}
      />
      <span
        className="absolute inset-0"
        style={{ backgroundColor: "var(--glow-amber)", ...maskLayer("/logo-icon-mask-illustration.png") }}
      />
    </span>
  );
}
