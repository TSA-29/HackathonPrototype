import { NextResponse } from "next/server";
import { z } from "zod";
import { AdaptReq } from "../../../src/lib/schemas";
import { mkRemedial } from "../../../src/lib/mockGen";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, currentBlockType } = AdaptReq.parse(body);
    const remedial = mkRemedial(topic, currentBlockType);
    return NextResponse.json(remedial);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
