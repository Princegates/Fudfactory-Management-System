import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { QuickCreateForm } from "@/components/portal/QuickCreateForm";
import { ExpenseRowControls } from "@/components/portal/ExpenseRowControls";

const CATEGORIES = ["Ingredients", "Electricity", "Water", "Rent", "Fuel", "Salaries", "Packaging", "Transportation", "Advertising", "Equipment Maintenance", "Other"];

export default async function ExpensesPage() {
  await requireStaff(["SUPER_ADMIN", "OWNER_MANAGER"]);

  const expenses = await prisma.expense.findMany({
    include: { recordedBy: true },
    orderBy: { expenseDate: "desc" },
    take: 100,
  });
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cocoa-900">Expenses</h1>
        <QuickCreateForm
          action="/api/expenses"
          buttonLabel="+ New Expense"
          fields={[
            { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
            { name: "amount", label: "Amount (GHS)", type: "number", step: "0.01", required: true },
            { name: "expenseDate", label: "Date", type: "date" },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>

      <p className="mt-4 text-sm text-cocoa-900/60">Total recorded: <span className="font-bold text-brand-700">{formatCurrency(total)}</span></p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-cocoa-900/50">
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Recorded By</th>
              <th className="p-3 text-right">Description, Amount &amp; Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-brand-50">
                <td className="p-3">{formatDate(e.expenseDate)}</td>
                <td className="p-3">{e.category}</td>
                <td className="p-3">{e.recordedBy?.name ?? "—"}</td>
                <td className="p-3 text-right">
                  <ExpenseRowControls expenseId={e.id} amount={e.amount} description={e.description ?? ""} />
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-cocoa-900/50">No expenses recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
