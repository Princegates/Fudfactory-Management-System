import { prisma } from "@/lib/prisma";
import { getStaffSession } from "@/lib/session";
import { csvResponse } from "@/lib/csv";

const ALLOWED_ROLES = ["SUPER_ADMIN", "OWNER_MANAGER"];

export async function GET() {
  const session = await getStaffSession();
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return new Response("Not authorized", { status: 403 });
  }

  const expenses = await prisma.expense.findMany({
    include: { recordedBy: true },
    orderBy: { expenseDate: "desc" },
  });

  return csvResponse(
    "expenses-report.csv",
    expenses.map((e) => ({
      Date: e.expenseDate.toISOString(),
      Category: e.category,
      Description: e.description ?? "",
      Amount: e.amount,
      RecordedBy: e.recordedBy?.name ?? "",
    })),
  );
}
