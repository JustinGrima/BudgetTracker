import { NextResponse } from "next/server";

import { upsertExpectedOverrideSchema } from "@/lib/schemas/expectedSchemas";
import { upsertOverride } from "@/lib/services/expectedService";

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = upsertExpectedOverrideSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await upsertOverride(parsed.data);
  return NextResponse.json(result);
}
