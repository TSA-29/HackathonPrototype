import { NextResponse } from "next/server";
import { z } from "zod";
import { SummaryQuery } from "../../../src/lib/schemas";
import { getAttempts, getSession } from "../../../src/lib/memory";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id") ?? "";
    const { id: sessionId } = SummaryQuery.parse({ id });
    const session = getSession(sessionId) || null;
    const att = getAttempts(sessionId);

    const total = att.length;
    const correct = att.filter(a => a.correct).length;
    const firstTry = att.filter(a => a.correct && a.firstTry).length;
    const withHint = att.filter(a => a.correct && a.hintUsed).length;
    const avgTimeMs = total ? Math.round(att.reduce((s,a)=>s+a.timeMs,0)/total) : 0;

    return NextResponse.json({
      sessionExists: !!session,
      totals: { total, correct, firstTry, withHint, avgTimeMs }
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "unexpected_error" }, { status: 500 });
  }
}
