"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSession } from "@/src/lib/store";

export default function MultiSummaryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, attempts } = useSession();

  // if session missing, redirect
  useEffect(() => {
    if (!session) router.push("/");
  }, [session, router]);

  const myAttempts = useMemo(
    () => attempts.filter((a) => a.sessionId === params.id),
    [attempts, params.id]
  );

  // group attempts by user
  const players: Record<string, typeof myAttempts> = {};
  myAttempts.forEach((a) => {
    if (!players[a.userId]) players[a.userId] = [];
    players[a.userId].push(a);
  });

  // calculate stats
  const stats = Object.entries(players).map(([name, list]) => {
    const total = list.length;
    const correct = list.filter((a) => a.correct).length;
    const avgTime =
      list.reduce((acc, a) => acc + (a.timeMs ?? 0), 0) / (total || 1);

    // weakness = most-missed block type
    const missesByType: Record<string, number> = {};
    list.forEach((a) => {
      if (!a.correct) {
        const block = session?.blocks.find((b) => b.id === a.blockId);
        if (block) {
          missesByType[block.type] = (missesByType[block.type] ?? 0) + 1;
        }
      }
    });
    const [weakness] =
      Object.entries(missesByType).sort((a, b) => b[1] - a[1])[0] ?? [];

    return {
      name,
      total,
      correct,
      avgTime,
      weakness: weakness ?? "—",
      score: list.reduce(
        (acc, a) => acc + (a.correct ? (a.hintUsed ? 0.5 : 1) : 0),
        0
      ),
    };
  });

  // find winner
  const winner = stats.reduce(
    (best, cur) => (cur.score > best.score ? cur : best),
    stats[0] || { name: "—", score: 0 }
  );

  if (!session) return null;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{session.topic}</h2>
          <div className="rounded-xl border px-3 py-1 text-sm">
            Multiplayer Summary
          </div>
        </header>

        <div className="space-y-4">
          {stats.map((s) => (
            <div
              key={s.name}
              className={`rounded-xl border p-4 ${
                s.name === winner.name ? "border-green-500 bg-green-50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">
                  {s.name}{" "}
                  {s.name === winner.name && (
                    <span className="ml-2 text-green-600 font-semibold">
                      🏆 Winner
                    </span>
                  )}
                </h3>
                <span className="font-semibold">{s.score.toFixed(1)} pts</span>
              </div>
              <p className="text-sm text-gray-700">
                Correct: {s.correct}/{s.total} ({(
                  (s.correct / (s.total || 1)) *
                  100
                ).toFixed(0)}
                %) | Avg time: {(s.avgTime / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-gray-600">
                Needs more practice on: <b>{s.weakness}</b>
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push("/room")}
            className="rounded-xl bg-black px-4 py-2 text-white"
          >
            Play Again
          </button>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(stats, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `multi_summary_${params.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="rounded-xl border px-4 py-2"
          >
            Export JSON
          </button>
        </div>
      </div>
    </main>
  );
}
