import { NextRequest, NextResponse } from "next/server";
import { getStaffSession } from "@/lib/session";
import { getSettings, setSettings, maskSecret, SETTING_KEYS } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

async function requireSuperAdmin() {
  const session = await getStaffSession();
  if (!session || session.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const s = await getSettings([
    SETTING_KEYS.paystackEnabled,
    SETTING_KEYS.paystackSecretKey,
    SETTING_KEYS.paystackPublicKey,
    SETTING_KEYS.hubtelEnabled,
    SETTING_KEYS.hubtelClientId,
    SETTING_KEYS.hubtelClientSecret,
    SETTING_KEYS.hubtelMerchantAccountNumber,
    SETTING_KEYS.manualMomoEnabled,
    SETTING_KEYS.manualMomoNumber,
    SETTING_KEYS.manualMomoNetwork,
    SETTING_KEYS.manualMomoInstructions,
  ]);

  return NextResponse.json({
    paystack: {
      enabled: s[SETTING_KEYS.paystackEnabled] === "true",
      publicKey: s[SETTING_KEYS.paystackPublicKey] ?? "",
      secretKeyMasked: maskSecret(s[SETTING_KEYS.paystackSecretKey]),
      secretKeyConfigured: Boolean(s[SETTING_KEYS.paystackSecretKey]),
    },
    hubtel: {
      enabled: s[SETTING_KEYS.hubtelEnabled] === "true",
      merchantAccountNumber: s[SETTING_KEYS.hubtelMerchantAccountNumber] ?? "",
      clientId: s[SETTING_KEYS.hubtelClientId] ?? "",
      clientSecretMasked: maskSecret(s[SETTING_KEYS.hubtelClientSecret]),
      clientSecretConfigured: Boolean(s[SETTING_KEYS.hubtelClientSecret]),
    },
    manualMomo: {
      enabled: s[SETTING_KEYS.manualMomoEnabled] === "true",
      number: s[SETTING_KEYS.manualMomoNumber] ?? "",
      network: s[SETTING_KEYS.manualMomoNetwork] ?? "MTN Mobile Money",
      instructions: s[SETTING_KEYS.manualMomoInstructions] ?? "",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const updates: Record<string, string | undefined> = {
    [SETTING_KEYS.paystackEnabled]: body.paystackEnabled !== undefined ? String(Boolean(body.paystackEnabled)) : undefined,
    [SETTING_KEYS.paystackPublicKey]: typeof body.paystackPublicKey === "string" ? body.paystackPublicKey.trim() : undefined,
    [SETTING_KEYS.hubtelEnabled]: body.hubtelEnabled !== undefined ? String(Boolean(body.hubtelEnabled)) : undefined,
    [SETTING_KEYS.hubtelClientId]: typeof body.hubtelClientId === "string" ? body.hubtelClientId.trim() : undefined,
    [SETTING_KEYS.hubtelMerchantAccountNumber]:
      typeof body.hubtelMerchantAccountNumber === "string" ? body.hubtelMerchantAccountNumber.trim() : undefined,
    [SETTING_KEYS.manualMomoEnabled]: body.manualMomoEnabled !== undefined ? String(Boolean(body.manualMomoEnabled)) : undefined,
    [SETTING_KEYS.manualMomoNumber]: typeof body.manualMomoNumber === "string" ? body.manualMomoNumber.trim() : undefined,
    [SETTING_KEYS.manualMomoNetwork]: typeof body.manualMomoNetwork === "string" ? body.manualMomoNetwork.trim() : undefined,
    [SETTING_KEYS.manualMomoInstructions]:
      typeof body.manualMomoInstructions === "string" ? body.manualMomoInstructions.trim() : undefined,
  };

  // Secrets: only overwrite when the admin actually typed a new value —
  // the form never sends back the masked placeholder as a real value.
  if (typeof body.paystackSecretKey === "string" && body.paystackSecretKey.trim()) {
    updates[SETTING_KEYS.paystackSecretKey] = body.paystackSecretKey.trim();
  }
  if (typeof body.hubtelClientSecret === "string" && body.hubtelClientSecret.trim()) {
    updates[SETTING_KEYS.hubtelClientSecret] = body.hubtelClientSecret.trim();
  }

  await setSettings(updates);
  await logAudit({
    userId: session.id,
    action: "PAYMENT_SETTINGS_UPDATE",
    entityType: "Setting",
    details: {
      paystackEnabled: body.paystackEnabled,
      hubtelEnabled: body.hubtelEnabled,
      manualMomoEnabled: body.manualMomoEnabled,
      secretsChanged: {
        paystack: Boolean(body.paystackSecretKey),
        hubtel: Boolean(body.hubtelClientSecret),
      },
    },
  });

  return NextResponse.json({ ok: true });
}
