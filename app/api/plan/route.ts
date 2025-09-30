import { NextResponse } from "next/server";
import { z } from "zod";
import { PlanReq } from "../../../src/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic } = PlanReq.parse(body);
    // Fixed sequence for MVP
    const sequence = [
      { type: "multiple_choice", difficulty: "easy" },
      { type: "fill_blank", difficulty: "medium" },
      { type: "ordering", difficulty: "medium" },
    ];
    return NextResponse.json({ topic, sequence });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
