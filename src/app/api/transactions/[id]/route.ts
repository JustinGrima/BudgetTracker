import { NextResponse } from "next/server";

import { deleteTransaction } from "@/lib/services/transactionService";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const deleted = await deleteTransaction(params.id);
  return NextResponse.json(deleted);
}
