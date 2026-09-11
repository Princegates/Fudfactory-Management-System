import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { prisma } from "@/lib/prisma";
import { getBusinessProfile } from "@/lib/business";

export const runtime = "nodejs";

// Plain ASCII money formatting — pdfkit's built-in standard fonts use
// WinAnsi encoding and can't render the Ghanaian cedi symbol (₵).
function money(amount: number) {
  return `GHS ${amount.toFixed(2)}`;
}

export async function GET() {
  const [categories, products, business] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ where: { isAvailable: true }, orderBy: { name: "asc" } }),
    getBusinessProfile(),
  ]);

  const doc = new PDFDocument({ size: "A4", margin: 56 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const maroon = "#6b1228";
  const ink = "#1a1013";
  const muted = "#6b6360";

  doc.font("Helvetica-Bold").fontSize(26).fillColor(maroon).text(business.businessName.toUpperCase(), { align: "center" });
  doc.font("Helvetica-Oblique").fontSize(11).fillColor(muted).text(business.tagline, { align: "center" });
  doc.moveDown(0.3);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor(maroon).lineWidth(1.2).stroke();
  doc.moveDown(1);

  for (const category of categories) {
    const items = products.filter((p) => p.categoryId === category.id);
    if (items.length === 0) continue;

    if (doc.y > doc.page.height - doc.page.margins.bottom - 100) {
      doc.addPage();
    }

    doc.font("Helvetica-Bold").fontSize(15).fillColor(maroon).text(category.name.toUpperCase(), { characterSpacing: 1 });
    doc.moveDown(0.4);

    for (const item of items) {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 50) {
        doc.addPage();
      }
      const startY = doc.y;
      const priceText = money(item.price);
      const priceWidth = doc.font("Helvetica-Bold").fontSize(11).widthOfString(priceText);
      const nameWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - priceWidth - 12;

      doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text(item.name, doc.page.margins.left, startY, { width: nameWidth, continued: false });
      doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text(priceText, doc.page.width - doc.page.margins.right - priceWidth, startY, { width: priceWidth, align: "right" });

      if (item.description) {
        doc.font("Helvetica-Oblique").fontSize(9).fillColor(muted).text(item.description, doc.page.margins.left, doc.y + 1, { width: nameWidth });
      }
      doc.moveDown(0.55);
    }
    doc.moveDown(0.7);
  }

  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(9).fillColor(muted).text(
    `${business.address}   |   ${business.phone}   |   ${business.email}   |   @${business.instagramHandle}`,
    { align: "center" }
  );

  doc.end();
  const buffer = await finished;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="fudfactory-menu.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
