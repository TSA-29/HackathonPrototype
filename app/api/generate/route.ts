import { NextResponse } from "next/server";
import { z } from "zod";
import { GenerateReq } from "../../../src/lib/schemas";
import { mkBlock } from "../../../src/lib/mockGen";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, block } = GenerateReq.parse(body);
    const spec = mkBlock(topic, block.type, block.difficulty);
    return NextResponse.json(spec);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
