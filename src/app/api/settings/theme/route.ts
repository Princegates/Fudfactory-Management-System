import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { isValidSiteTheme } from "@/lib/themes";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const theme = body?.theme;
  if (typeof theme !== "string" || !isValidSiteTheme(theme)) {
    return NextResponse.json({ error: "Invalid theme." }, { status: 400 });
  }

  await setSetting(SETTING_KEYS.siteTheme, theme);
  await logAudit({ userId: session.id, action: "SITE_THEME_CHANGE", entityType: "Setting", details: { theme } });

  return NextResponse.json({ ok: true });
}
