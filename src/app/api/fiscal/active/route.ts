import { NextResponse } from "next/server";

import { setActiveFiscalSchema } from "@/lib/schemas/fiscalSchemas";
import { getActiveContext, setActiveContext } from "@/lib/services/fiscalService";

export async function GET() {
  const context = await getActiveContext();
  return NextResponse.json(context);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = setActiveFiscalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await setActiveContext(parsed.data);
  return NextResponse.json(result);
}
