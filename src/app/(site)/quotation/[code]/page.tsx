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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {submitted && (
        <div className="mb-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Thanks! Your request has been received. Reference code: <strong>{quotation.code}</strong>.
          Save this page link to check for your quotation.
        </div>
      )}

      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-cocoa-900">Quotation {quotation.code}</h1>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            {quotation.status}
          </span>
        </div>
        <dl className="mt-4 grid gap-2 text-sm text-cocoa-900/80 sm:grid-cols-2">
          <div><dt className="font-semibold">Name</dt><dd>{quotation.customerName}</dd></div>
          <div><dt className="font-semibold">Phone</dt><dd>{quotation.phone}</dd></div>
          <div><dt className="font-semibold">Event type</dt><dd>{quotation.eventType}</dd></div>
          {quotation.eventDate && (
            <div><dt className="font-semibold">Event date</dt><dd>{formatDate(quotation.eventDate)}</dd></div>
          )}
          {quotation.guestCount && (
            <div><dt className="font-semibold">Guests</dt><dd>{quotation.guestCount}</dd></div>
          )}
        </dl>
        {quotation.requirements && (
          <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-cocoa-900/80">{quotation.requirements}</p>
        )}

        {items.length > 0 ? (
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-cocoa-900/60">
                <th className="py-2">Item</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-brand-50">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-6 text-sm text-cocoa-900/60">
            We&apos;re preparing your quotation — we&apos;ll reach out by phone or WhatsApp shortly.
          </p>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex justify-end gap-8 text-sm text-cocoa-900/80">
            <span>Delivery fee</span>
            <span>{formatCurrency(quotation.deliveryFee)}</span>
          </div>
        )}
        {items.length > 0 && (
          <div className="mt-1 flex justify-end gap-8 text-lg font-bold text-brand-700">
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
          <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Quotation accepted — our team will contact you to arrange payment and delivery.
          </p>
        )}
      </div>
    </div>
  );
}
