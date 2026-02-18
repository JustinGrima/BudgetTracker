import { NextResponse } from "next/server";

import { createLineItemSchema } from "@/lib/schemas/catalogSchemas";
import { createLineItem } from "@/lib/services/catalogService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createLineItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lineItem = await createLineItem({
    ...parsed.data,
    group: { connect: { id: parsed.data.groupId } }
  });

  return NextResponse.json(lineItem, { status: 201 });
}
