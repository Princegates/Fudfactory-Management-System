import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { QuotationEditor } from "@/components/portal/QuotationEditor";

export default async function QuotationDetailPage({ params }: { params: Promise<{ code: string }> }) {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);
  const { code } = await params;

  const quotation = await prisma.quotation.findUnique({ where: { code } });
  if (!quotation) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Quotation {quotation.code}</h1>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{quotation.status}</span>
      </div>

      <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-5">
        <dl className="grid gap-2 text-sm text-cocoa-900/80 sm:grid-cols-2">
          <div><dt className="font-semibold">Name</dt><dd>{quotation.customerName}</dd></div>
          <div><dt className="font-semibold">Phone</dt><dd>{quotation.phone}</dd></div>
          <div><dt className="font-semibold">Event type</dt><dd>{quotation.eventType}</dd></div>
          {quotation.eventDate && <div><dt className="font-semibold">Event date</dt><dd>{formatDate(quotation.eventDate)}</dd></div>}
          {quotation.guestCount && <div><dt className="font-semibold">Guests</dt><dd>{quotation.guestCount}</dd></div>}
        </dl>
        {quotation.requirements && (
          <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-cocoa-900/80">{quotation.requirements}</p>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="mb-3 font-bold text-cocoa-900">Build Quotation</h2>
        <QuotationEditor
          code={quotation.code}
          initialItems={JSON.parse(quotation.items)}
          initialDeliveryFee={quotation.deliveryFee}
          status={quotation.status}
        />
      </div>
    </div>
  );
}
