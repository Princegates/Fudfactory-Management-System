import { ImageResponse } from "next/og";
import { getBusinessProfile } from "@/lib/business";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { SITE_THEMES, DEFAULT_SITE_THEME } from "@/lib/themes";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Generated per-deployment from the business name and chosen theme, so a
 * vendor gets a correct favicon automatically with no logo file to supply. */
export default async function Icon() {
  const [business, themeSlug] = await Promise.all([
    getBusinessProfile(),
    getSetting(SETTING_KEYS.siteTheme, DEFAULT_SITE_THEME),
  ]);
  const theme = SITE_THEMES.find((t) => t.slug === themeSlug) ?? SITE_THEMES[0];
  const initial = business.businessName.trim().charAt(0).toUpperCase() || "?";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.swatch.amber,
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 6,
        }}
      >
        {initial}
      </div>
    ),
    { ...size },
  );
}
