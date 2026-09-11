import type { Metadata } from "next";
import { QuotationRequestForm } from "@/components/site/QuotationRequestForm";
import { Reveal } from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Custom & Event Orders",
  description: "Request a quotation for birthday cakes, weddings, corporate orders and full event planning.",
};

export default function CustomOrdersPage() {
  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-bold" style={{ color: "var(--text-hi)" }}>
            Custom Orders &amp; <span className="text-gradient">Event Planning</span>
          </h1>
          <p className="mt-3" style={{ color: "var(--text-mid)" }}>
            Planning a birthday, wedding, graduation or corporate event? Beyond cakes and catering,
            we also offer full event planning services. Tell us what you need and we&apos;ll send you
            a quotation.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-strong mt-8 rounded-2xl p-6">
            <QuotationRequestForm />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
