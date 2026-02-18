import { prisma } from "@/lib/db/prisma";
import { computeRollups } from "@/lib/services/rollupService";
import { formatCurrency } from "@/lib/utils/currency";
import { ExpenseDistributionChart, MonthlyExpensesChart } from "@/components/dashboard/Charts";
import { TopBar } from "@/components/dashboard/TopBar";

function monthLabel(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: 1 },
    include: {
      activeFiscalYear: { include: { months: { orderBy: { monthIndex: "asc" } } } },
      activeFiscalMonth: true
    }
  });

  if (!settings?.activeFiscalMonth || !settings.activeFiscalYear) {
    return <main className="p-8">Run `npm run prisma:seed` first to initialize fiscal data.</main>;
  }

  const [years, transactions, rollups] = await Promise.all([
    prisma.fiscalYear.findMany({ orderBy: { startYear: "desc" } }),
    prisma.transaction.findMany({ where: { fiscalMonthId: settings.activeFiscalMonth.id }, orderBy: { date: "desc" } }),
    computeRollups(settings.activeFiscalMonth.id)
  ]);

  return (
    <main className="min-h-screen space-y-4 bg-slateSoft p-4 md:p-6">
      <TopBar
        years={years.map((year) => ({ id: year.id, label: year.label }))}
        months={settings.activeFiscalYear.months.map((month) => ({ id: month.id, label: monthLabel(month.monthKey) }))}
        activeYearId={settings.activeFiscalYear.id}
        activeMonthId={settings.activeFiscalMonth.id}
      />

      <section className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p>Income: {formatCurrency(rollups.totals.incomeCents)}</p>
          <p>Expense: {formatCurrency(rollups.totals.expenseCents)}</p>
          <p>Expected: {formatCurrency(rollups.totals.expectedExpenseCents)}</p>
          <p className="text-xl font-semibold">Net: {formatCurrency(rollups.totals.netCents)}</p>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-6">
          <h2 className="mb-2 text-lg font-semibold">Monthly Expenses</h2>
          <MonthlyExpensesChart
            groupNames={rollups.byGroup.map((group) => group.groupName)}
            groupActuals={rollups.byGroup.map((group) => group.actualCents / 100)}
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-3">
          <h2 className="mb-2 text-lg font-semibold">Expense Distribution</h2>
          <ExpenseDistributionChart
            groupNames={rollups.byGroup.map((group) => group.groupName)}
            groupActuals={rollups.byGroup.map((group) => group.actualCents / 100)}
          />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-6">
          <h2 className="mb-2 text-lg font-semibold">Top Expenses</h2>
          <ul className="space-y-1 text-sm">
            {rollups.byLineItem
              .sort((a, b) => b.actualCents - a.actualCents)
              .slice(0, 8)
              .map((item) => (
                <li key={item.lineItemId} className="flex justify-between border-b py-1">
                  <span>{item.groupName} / {item.lineItemName}</span>
                  <span>{formatCurrency(item.actualCents)}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-6">
          <h2 className="mb-2 text-lg font-semibold">Expected vs Actual</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Line Item</th>
                <th>Expected</th>
                <th>Actual</th>
              </tr>
            </thead>
            <tbody>
              {rollups.byLineItem.map((item) => (
                <tr key={item.lineItemId} className="border-b last:border-none">
                  <td className="py-2">{item.groupName} / {item.lineItemName}</td>
                  <td>{formatCurrency(item.expectedCents)}</td>
                  <td>{formatCurrency(item.actualCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm lg:col-span-12">
          <h2 className="mb-2 text-lg font-semibold">Transactions</h2>
          <ul className="space-y-2 text-sm">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between rounded border p-2">
                <div>
                  <p className="font-medium">{tx.groupName} / {tx.lineItemName}</p>
                  <p className="text-slate-500">{new Date(tx.date).toLocaleDateString()} • {tx.kind}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span>{formatCurrency(tx.amountCents)}</span>
                  <button className="rounded bg-slate-200 px-2 py-1">Delete</button>
                </div>
              </li>
            ))}
            {transactions.length === 0 && <li className="text-slate-500">No transactions yet.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
