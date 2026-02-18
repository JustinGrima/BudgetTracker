import { NextResponse } from "next/server";

import { listTransactionsSchema, createTransactionSchema } from "@/lib/schemas/transactionSchemas";
import { createTransaction, listByMonth } from "@/lib/services/transactionService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listTransactionsSchema.safeParse({ fiscalMonthId: searchParams.get("fiscalMonthId") });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = await listByMonth(parsed.data.fiscalMonthId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createTransaction({
    fiscalMonth: { connect: { id: parsed.data.fiscalMonthId } },
    date: parsed.data.date,
    amountCents: parsed.data.amountCents,
    kind: parsed.data.kind,
    groupName: parsed.data.groupName,
    lineItemName: parsed.data.lineItemName,
    note: parsed.data.note
  });

  return NextResponse.json(created, { status: 201 });
}
