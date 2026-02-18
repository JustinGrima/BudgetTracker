type Option = { id: string; label: string };

type TopBarProps = {
  years: Option[];
  months: Option[];
  activeYearId?: string;
  activeMonthId?: string;
};

export function TopBar({ years, months, activeYearId, activeMonthId }: TopBarProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold tracking-wide text-purple-900">Fiscal Dashboard</h1>
        <select defaultValue={activeYearId} className="rounded border px-3 py-2">
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.label}
            </option>
          ))}
        </select>
        <select defaultValue={activeMonthId} className="rounded border px-3 py-2">
          {months.map((month) => (
            <option key={month.id} value={month.id}>
              {month.label}
            </option>
          ))}
        </select>
        <button className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">Add Income</button>
        <button className="rounded bg-rose-500 px-4 py-2 text-sm font-semibold text-white">Add Expense</button>
      </div>
    </div>
  );
}
