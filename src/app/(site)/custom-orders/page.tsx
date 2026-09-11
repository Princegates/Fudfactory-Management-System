import type { Metadata } from "next";
import { QuotationRequestForm } from "@/components/site/QuotationRequestForm";

export const metadata: Metadata = {
  title: "Custom & Event Orders",
  description: "Request a quotation for birthday cakes, weddings, corporate and bulk orders.",
};

export default function CustomOrdersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-cocoa-900">Custom &amp; Event Orders</h1>
      <p className="mt-2 text-cocoa-900/70">
        Planning a birthday, wedding, graduation or corporate event? Tell us what you need and
        we&apos;ll send you a quotation.
      </p>
      <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <QuotationRequestForm />
      </div>
    </div>
  );
}
