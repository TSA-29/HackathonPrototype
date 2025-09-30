"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/store";
import { useEffect, useMemo } from "react";

export default function SummaryPage() {
  const params = useParams<{ id: string }>();
  const { session, attempts } = useSession();
  const router = useRouter();

  // if session not found, go home
  useEffect(() => {
    if (!session) {
      router.push("/");
    }
  }, [session, router]);

  const myAttempts = useMemo(
    () => attempts.filter((a) => a.sessionId === params.id),
    [attempts, params.id]
  );

  const score = myAttempts.reduce(
    (acc, a) => acc + (a.correct ? (a.hintUsed ? 0.5 : 1) : 0),
    0
  );

  const totalTime = myAttempts.reduce((acc, a) => acc + (a.timeMs ?? 0), 0);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(myAttempts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session_${params.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) return null;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{session.topic}</h2>
            <p className="text-sm text-gray-600">Session Summary</p>
          </div>
          <div className="rounded-xl border px-3 py-1 text-sm">
            Score: {score.toFixed(1)} / {session.blocks.length}
          </div>
        </header>

        <div className="text-gray-700">
          <p>Total Attempts: {myAttempts.length}</p>
          <p>Total Time: {(totalTime / 1000).toFixed(1)}s</p>
        </div>

        <div className="space-y-3">
          {session.blocks.map((b, i) => {
            const att = myAttempts.filter((a) => a.blockId === b.id);
            const last = att[att.length - 1];
            return (
              <div key={b.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {i + 1}. {b.prompt}
                  </span>
                  <span>
                    {last?.correct ? "✔️ Correct" : "❌ Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {att.length} attempt(s) |{" "}
                  {last ? (last.timeMs / 1000).toFixed(1) : "—"}s
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportJson}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Export JSON
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-xl border px-4 py-2"
          >
            Play Again
          </button>
        </div>
      </div>
    </main>
  );
}
