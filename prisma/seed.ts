import { GroupKind } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { prisma } from "../src/lib/db/prisma";
import { parseBudgetCsv } from "../src/lib/seed/parseBudgetCsv";
import { dollarsToCents } from "../src/lib/utils/currency";

const EXPENSE_CSV_PATH = "/mnt/data/Budget Expenses - Sheet1.csv";
const INCOME_CSV_PATH = "/mnt/data/budget_ Income - Income.csv";

function currentFiscalStart(date = new Date()) {
  const month = date.getMonth() + 1;
  return month >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

function monthKey(startYear: number, monthIndex: number) {
  const date = new Date(startYear, 6 + monthIndex, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function loadCsv(csvPath: string): string {
  if (!existsSync(csvPath)) {
    console.warn(`CSV not found at ${csvPath}; continuing with empty defaults.`);
    return "";
  }
  return readFileSync(path.resolve(csvPath), "utf-8");
}

async function seedGroups(kind: GroupKind, csvContent: string) {
  const parsed = parseBudgetCsv(csvContent);
  const uniqueGroups = [...new Set(parsed.map((item) => item.groupName))];

  for (const [groupOrder, groupName] of uniqueGroups.entries()) {
    const group = await prisma.group.upsert({
      where: { kind_name: { kind, name: groupName } },
      update: { sortOrder: groupOrder },
      create: { kind, name: groupName, sortOrder: groupOrder }
    });

    const lineItems = parsed.filter((item) => item.groupName === groupName);
    for (const [lineOrder, lineItem] of lineItems.entries()) {
      await prisma.lineItem.upsert({
        where: { groupId_name: { groupId: group.id, name: lineItem.lineItemName } },
        update: {
          sortOrder: lineOrder,
          defaultExpectedCents: kind === GroupKind.EXPENSE ? dollarsToCents(lineItem.averageDollars) : 0
        },
        create: {
          groupId: group.id,
          name: lineItem.lineItemName,
          sortOrder: lineOrder,
          defaultExpectedCents: kind === GroupKind.EXPENSE ? dollarsToCents(lineItem.averageDollars) : 0
        }
      });
    }
  }
}

async function main() {
  const startYear = currentFiscalStart();
  const fiscalLabel = `FY${startYear + 1}`;

  const fiscalYear = await prisma.fiscalYear.upsert({
    where: { label: fiscalLabel },
    update: { startYear, startMonth: 7 },
    create: { label: fiscalLabel, startYear, startMonth: 7 }
  });

  const months = [];
  for (let i = 0; i < 12; i += 1) {
    const month = await prisma.fiscalMonth.upsert({
      where: { fiscalYearId_monthIndex: { fiscalYearId: fiscalYear.id, monthIndex: i } },
      update: { monthKey: monthKey(startYear, i) },
      create: { fiscalYearId: fiscalYear.id, monthIndex: i, monthKey: monthKey(startYear, i) }
    });
    months.push(month);
  }

  await seedGroups(GroupKind.EXPENSE, loadCsv(EXPENSE_CSV_PATH));
  await seedGroups(GroupKind.INCOME, loadCsv(INCOME_CSV_PATH));

  await prisma.settings.upsert({
    where: { id: 1 },
    update: { activeFiscalYearId: fiscalYear.id, activeFiscalMonthId: months[0].id },
    create: { id: 1, activeFiscalYearId: fiscalYear.id, activeFiscalMonthId: months[0].id }
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
