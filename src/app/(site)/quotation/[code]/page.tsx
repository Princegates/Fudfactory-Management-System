import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { AcceptQuotationButton } from "@/components/site/AcceptQuotationButton";

type QuotationItem = { description: string; quantity: number; unitPrice: number };

export default async function QuotationViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { code } = await params;
  const { submitted } = await searchParams;
  const quotation = await prisma.quotation.findUnique({ where: { code } });
  if (!quotation) notFound();

  const items: QuotationItem[] = JSON.parse(quotation.items);

  return (
    <div className="relative">
      <div className="aurora-bg opacity-30" />
      <div className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6">
        {submitted && (
          <div className="glass mb-6 rounded-xl px-4 py-3 text-sm" style={{ color: "var(--glow-amber)" }}>
            Thanks! Your request has been received. Reference code: <strong>{quotation.code}</strong>.
            Save this page link to check for your quotation.
          </div>
        )}

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-hi)" }}>
              Quotation {quotation.code}
            </h1>
            <span className="chip rounded-full px-3 py-1 text-xs font-semibold" data-active="true">
              {quotation.status}
            </span>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2" style={{ color: "var(--text-mid)" }}>
            <div><dt className="font-semibold" style={{ color: "var(--text-hi)" }}>Name</dt><dd>{quotation.customerName}</dd></div>
            <div><dt className="font-semibold" style={{ color: "var(--text-hi)" }}>Phone</dt><dd>{quotation.phone}</dd></div>
            <div><dt className="font-semibold" style={{ color: "var(--text-hi)" }}>Event type</dt><dd>{quotation.eventType}</dd></div>
            {quotation.eventDate && (
              <div><dt className="font-semibold" style={{ color: "var(--text-hi)" }}>Event date</dt><dd>{formatDate(quotation.eventDate)}</dd></div>
            )}
            {quotation.guestCount && (
              <div><dt className="font-semibold" style={{ color: "var(--text-hi)" }}>Guests</dt><dd>{quotation.guestCount}</dd></div>
            )}
          </dl>
          {quotation.requirements && (
            <p className="glass mt-4 rounded-lg p-3 text-sm" style={{ color: "var(--text-mid)" }}>{quotation.requirements}</p>
          )}

          {items.length > 0 ? (
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: "var(--ink-border)", color: "var(--text-lo)" }}>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b" style={{ borderColor: "var(--ink-border)", color: "var(--text-mid)" }}>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-2 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-6 text-sm" style={{ color: "var(--text-lo)" }}>
              We&apos;re preparing your quotation — we&apos;ll reach out by phone or WhatsApp shortly.
            </p>
          )}

          {items.length > 0 && (
            <div className="mt-4 flex justify-end gap-8 text-sm" style={{ color: "var(--text-mid)" }}>
              <span>Delivery fee</span>
              <span>{formatCurrency(quotation.deliveryFee)}</span>
            </div>
          )}
          {items.length > 0 && (
            <div className="mt-1 flex justify-end gap-8 font-display text-lg font-bold text-gradient">
              <span>Total</span>
              <span>{formatCurrency(quotation.totalAmount)}</span>
            </div>
          )}

          {quotation.status === "SENT" && (
            <div className="mt-6">
              <AcceptQuotationButton code={quotation.code} />
            </div>
          )}
          {quotation.status === "ACCEPTED" && (
            <p className="mt-6 rounded-lg bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
              Quotation accepted — our team will contact you to arrange payment and delivery.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
