import { NextResponse } from "next/server";

import { createGroupSchema } from "@/lib/schemas/catalogSchemas";
import { createGroup } from "@/lib/services/catalogService";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const group = await createGroup(parsed.data);
  return NextResponse.json(group, { status: 201 });
}
