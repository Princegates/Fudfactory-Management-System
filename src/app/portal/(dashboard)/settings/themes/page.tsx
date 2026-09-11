import { requireStaff } from "@/lib/session";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { DEFAULT_SITE_THEME } from "@/lib/themes";
import { ThemePicker } from "@/components/portal/ThemePicker";

export default async function ThemesSettingsPage() {
  await requireStaff(["SUPER_ADMIN"]);
  const current = (await getSetting(SETTING_KEYS.siteTheme, DEFAULT_SITE_THEME)) ?? DEFAULT_SITE_THEME;

  return (
    <div>
      <h2 className="text-lg font-bold text-cocoa-900">Themes</h2>
      <p className="mt-1 text-sm text-cocoa-900/60">
        Pick the accent palette for the public website. Applies instantly, site-wide — no code changes needed.
      </p>
      <div className="mt-6">
        <ThemePicker current={current} />
      </div>
    </div>
  );
}
