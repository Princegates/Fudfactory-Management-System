import type { CSSProperties, ReactNode } from "react";

const COMMON = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconName =
  | "cake"
  | "pastry"
  | "donut"
  | "bowl"
  | "cup"
  | "egg"
  | "event"
  | "bike"
  | "card"
  | "gift"
  | "box"
  | "chef"
  | "sparkle"
  | "sun"
  | "moon"
  | "arrow-right"
  | "external"
  | "cloche";

const PATHS: Record<IconName, ReactNode> = {
  cake: (
    <>
      <path d="M4 20h16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z" />
      <path d="M4 15c1.2-1 1.8-1 3 0s1.8 1 3 0 1.8-1 3 0 1.8-1 3 0 1.8-1 3-1" />
      <path d="M9 12V9M15 12V9M12 9V6" />
      <path d="M9 6.5c0-1 1-1 1-2s-1-1-1-1M15 6.5c0-1 1-1 1-2s-1-1-1-1M12 4c0-.8.7-.8.7-1.6S12 1.6 12 1" />
    </>
  ),
  pastry: (
    <>
      <path d="M4.5 16c0-6 4-11.5 11-11.5-2 2-2.5 4-2 6.5 3-1 5 0 6 2-6 .5-9.5 3.5-11 8-1.5-1.5-3-3-4-5z" />
      <path d="M8 11.5c1.2.6 2.3 1.5 3 2.8" />
    </>
  ),
  donut: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M9 6.5l.6 1.4M15 6.5l-.6 1.4M6.5 12h1.6M17.5 12h-1.6M8 17l.9-1.2M16 17l-.9-1.2" />
    </>
  ),
  bowl: (
    <>
      <path d="M3.5 12h17a8.5 4 0 0 1-17 0z" />
      <path d="M5 12a7 7 0 0 1 14 0" opacity="0.5" />
      <path d="M9.5 6c-.6-1-.6-1.8 0-2.6M12.5 5.5c-.4-1.1-.2-2 .5-2.8M15.3 6.2c.3-1 0-1.9-.5-2.6" />
    </>
  ),
  cup: (
    <>
      <path d="M6 5h11l-1 12a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 17z" />
      <path d="M17 7.5h1.5a2 2 0 0 1 0 4H16.7" />
      <path d="M11 2.5v2M14 2.5v2" />
    </>
  ),
  egg: (
    <>
      <ellipse cx="10.5" cy="12.5" rx="6.5" ry="5" />
      <circle cx="10" cy="12" r="2.4" />
    </>
  ),
  event: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v4M16 3.5v4" />
      <path d="M8 14.5l1.5 1.5L13 12.5" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17l4-7h4l3 7" />
      <path d="M10 10H8.5M13 6h3l1.5 4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10.5h18" />
      <path d="M6.5 15h4" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="10" width="16" height="9.5" rx="1.5" />
      <path d="M4 13.5h16" />
      <path d="M12 10v9.5" />
      <path d="M12 10C9 10 8 8.7 8 7.3 8 6 9 5 10 5c1.7 0 2 2.3 2 5z" />
      <path d="M12 10c3 0 4-1.3 4-2.7C16 6 15 5 14 5c-1.7 0-2 2.3-2 5z" />
    </>
  ),
  box: (
    <>
      <path d="M4 8.5l8-4 8 4-8 4z" />
      <path d="M4 8.5v7l8 4 8-4v-7" />
      <path d="M12 12.5v7" />
    </>
  ),
  chef: (
    <>
      <path d="M7 11c-2.2-.4-3-2-3-3.4C4 5.8 5.4 4.5 7 4.7c.3-1.4 1.7-2.4 3-2.4 1 0 1.9.5 2.4 1.3.5-.3 1.1-.5 1.7-.5 1.7 0 3 1.4 3 3.1 0 .2 0 .4-.1.6 1.4.2 2.5 1.4 2.5 2.9 0 1.4-.9 2.6-2.5 2.9" />
      <path d="M6.5 11h11v3h-11z" />
      <path d="M6 21v-6h12v6" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z" />
      <path d="M19 15l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />,
  "arrow-right": <path d="M4 12h15M13 6l6 6-6 6" />,
  external: <path d="M8 16 16 8M9.5 8H16v6.5" />,
  cloche: (
    <>
      <circle cx="12" cy="3.4" r="0.9" fill="currentColor" stroke="none" />
      <path d="M12 4.3v1" />
      <path d="M5 14C5 9 8 5.3 12 5.3S19 9 19 14" />
      <path d="M6.6 10.2H16" />
      <path d="M6.1 11.9h10.6" />
      <path d="M3.8 14h16.4" />
      <path d="M13.2 13.6v2.2M14 13.4v2.4M14.8 13.6v2.2" />
      <path d="M14.4 15.7 17.6 19" />
      <path d="M17 16.2h2.6v3.4H17z" />
      <path d="M17 18h2.6" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden {...COMMON}>
      {PATHS[name]}
    </svg>
  );
}
