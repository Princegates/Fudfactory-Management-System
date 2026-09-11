import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { setSettings, isSecretKey, SETTING_KEYS } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

const ALLOWED_KEYS = new Set<string>(Object.values(SETTING_KEYS));

/**
 * Generic save endpoint for the simple settings pages (Notifications, SMS,
 * Email, WhatsApp, Receipts, Currency): pass { values: { settingKey: value } }.
 * Only keys in SETTING_KEYS are accepted. Secret-looking keys (password,
 * token, apiKey, secret) are skipped when the submitted value is blank, so
 * a form doesn't need to know the current secret to avoid erasing it.
 */
export async function PATCH(request: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const values = body?.values;
  if (!values || typeof values !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Record<string, string | undefined> = {};
  for (const [key, raw] of Object.entries(values)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    const value = typeof raw === "string" ? raw.trim() : String(raw ?? "");
    if (isSecretKey(key) && !value) continue; // keep existing secret
    updates[key] = value;
  }

  await setSettings(updates);
  await logAudit({
    userId: session.id,
    action: "SETTINGS_UPDATE",
    entityType: "Setting",
    details: { keys: Object.keys(updates) },
  });

  return NextResponse.json({ ok: true });
}
