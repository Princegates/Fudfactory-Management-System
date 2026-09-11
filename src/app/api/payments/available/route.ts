import { NextResponse } from "next/server";
import { getPaymentGatewayConfig, getManualMomoConfig } from "@/lib/settings";
import { HUBTEL_MOMO_CHANNELS } from "@/lib/payments/hubtel";

/** Public — tells the checkout UI which gateways/manual methods are live. No secrets returned. */
export async function GET() {
  const [gatewayConfig, manualMomo] = await Promise.all([getPaymentGatewayConfig(), getManualMomoConfig()]);
  return NextResponse.json({
    paystack: gatewayConfig.paystack.enabled,
    hubtel: gatewayConfig.hubtel.enabled,
    hubtelChannels: HUBTEL_MOMO_CHANNELS,
    manualMomo: manualMomo.enabled
      ? { number: manualMomo.number, network: manualMomo.network, instructions: manualMomo.instructions }
      : null,
  });
}
