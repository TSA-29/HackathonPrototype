"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/store";
import type { BlockSpec, Session } from "@/src/lib/types";
import { isCorrect } from "@/src/lib/eval";

import MultipleChoice from "@/components/blocks/MultipleChoice";
import FillBlank from "@/components/blocks/FillBlank";
import Ordering from "@/components/blocks/Ordering";
import TimerBadge from "@/components/TimerBadge";
import Scoreboard from "@/components/Scoreboard";
import { useSocket } from "@/src/lib/useSocket";

export default function SessionPage() {
  const search = useSearchParams();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const topic = (search?.get("topic") ?? "").trim();
  const socket = useSocket();
  const mode = search?.get("mode") ?? "solo";
  const name = search?.get("name") ?? "anon";
  const roomId = params.id;

  const { session, setSession, currentIndex, next, addAttempt, insertRemedial } = useSession();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  // refs to avoid StrictMode double effects and to track per-block state
  const bootRef = useRef(false);
  const blockTimerRef = useRef<number>(0);
  const firstTryRef = useRef<Record<string, boolean>>({});
  const wrongStreakRef = useRef<Record<string, number>>({}); // counts consecutive wrongs per block
  const lastStartRef = useRef<number>(0); // for TimerBadge

  // boot once: plan + generate all blocks
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    (async () => {
      if (!topic) {
        router.push("/");
        return;
      }
      setLoading(true);
      try {
        const planRes = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });
        const { sequence } = await planRes.json();

        const blocks: BlockSpec[] = [];
        for (const b of sequence as { type: any; difficulty: any }[]) {
          const r = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, block: b }),
          });
          blocks.push(await r.json());
        }

        const s: Session = {
          id: params.id,
          topic,
          blocks,
          mode: "solo",
          createdAt: Date.now(),
        };
        setSession(s);

        // Emit session to room if host
        if (mode === "versus" && socket) {
          socket.emit("sessionReady", { roomId: params.id, session: s });
        }

        const ft: Record<string, boolean> = {};
        const ws: Record<string, number> = {};
        blocks.forEach((bk) => {
          ft[bk.id] = true;
          ws[bk.id] = 0;
        });
        firstTryRef.current = ft;
        wrongStreakRef.current = ws;
        blockTimerRef.current = performance.now();
        lastStartRef.current = blockTimerRef.current;
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, setSession, topic, mode, socket]);

  // Listen for remote session (if joining)
  useEffect(() => {
    if (mode === "versus" && socket) {
      socket.on("sessionStart", (remote: Session) => {
        setSession(remote);
      });
      socket.on("scoreUpdate", ({ userId, correct }) => {
        // TODO: update scoreboard state
        console.log("Score update", userId, correct);
      });
      socket.on("advanceBlock", () => {
        next();
      });
    }
  }, [mode, socket, setSession, next]);

  const currentBlock: BlockSpec | undefined = useMemo(
    () => session?.blocks[currentIndex],
    [session, currentIndex]
  );

  // when current block changes, reset block timer
  useEffect(() => {
    blockTimerRef.current = performance.now();
    lastStartRef.current = blockTimerRef.current;
  }, [currentIndex]);

  const maybeAdapt = async (reason: "two_wrong" | "slow_with_hint", block: BlockSpec) => {
    try {
      const r = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, currentBlockType: block.type }),
      });
      const remedial: BlockSpec = await r.json();
      insertRemedial(remedial);
      // small cue for demo purposes
      alert(`Added a remedial ${block.type} block (${reason.replace(/_/g, " ")})`);
    } catch {
      // ignore errors silently for MVP
    }
  };

  const onSubmit = (answer: any, meta?: { hintUsed?: boolean }) => {
    if (!session || !currentBlock) return;

    const elapsed = Math.round(performance.now() - blockTimerRef.current);
    const ok = isCorrect(currentBlock, answer);
    const firstTry = firstTryRef.current[currentBlock.id];
    const hintUsed = meta?.hintUsed ?? false;

    // scoring
    const delta = ok ? (hintUsed ? 0.5 : firstTry ? 1 : 1) : 0;
    setScore((s) => s + delta);

    // record locally
    addAttempt({
      sessionId: session.id,
      blockId: currentBlock.id,
      userId: "local",
      answer,
      correct: ok,
      firstTry,
      hintUsed,
      timeMs: elapsed,
      timestamp: Date.now(),
    });

    // Emit score update if multiplayer
    if (mode === "versus" && socket) {
      socket.emit("submit", { roomId: params.id, userId: name, correct: ok });
      socket.emit("nextBlock", { roomId: params.id });
    }

    // update firstTry / wrong streaks
    firstTryRef.current[currentBlock.id] = false;
    if (ok) {
      wrongStreakRef.current[currentBlock.id] = 0;
    } else {
      wrongStreakRef.current[currentBlock.id] = (wrongStreakRef.current[currentBlock.id] ?? 0) + 1;
    }

    // ---- Adaptivity rules ----
    // 1) Two wrong in a row on the same block → insert remedial of SAME type
    if (!ok && wrongStreakRef.current[currentBlock.id] >= 2) {
      wrongStreakRef.current[currentBlock.id] = 0; // reset
      void maybeAdapt("two_wrong", currentBlock);
    }
    // 2) Slow + hint → remedial
    if (hintUsed && elapsed > 20000) {
      void maybeAdapt("slow_with_hint", currentBlock);
    }
    // --------------------------

    // move on
    setTimeout(() => {
      blockTimerRef.current = performance.now();
      lastStartRef.current = blockTimerRef.current;
      const lastIndex = (session?.blocks.length ?? 1) - 1;
      if (currentIndex >= lastIndex) {
        if (mode === "versus") {
          router.push(`/summary-multi/${session.id}`);
        } else {
          router.push(`/summary/${session.id}`);
        }
      } else {
        next();
      }
    }, 150);
  };

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{session?.topic || topic || "Session"}</h2>
            <p className="text-sm text-gray-600">
              Block {currentIndex + 1} / {session?.blocks.length ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {mode === "versus" && socket && <Scoreboard socket={socket} roomId={roomId} />}
            <div className="rounded-xl border px-3 py-1 text-sm">Score: {score.toFixed(1)}</div>
          </div>
        </header>

        {loading && <div className="text-gray-600">Preparing your session…</div>}

        {!loading && currentBlock && (
          <div className="rounded-2xl border p-5">
            <h3 className="mb-3 text-lg font-medium">{currentBlock.prompt}</h3>
            {currentBlock.type === "multiple_choice" && (
              <MultipleChoice block={currentBlock} onSubmit={onSubmit} />
            )}
            {currentBlock.type === "fill_blank" && (
              <FillBlank block={currentBlock} onSubmit={onSubmit} />
            )}
            {currentBlock.type === "ordering" && (
              <Ordering block={currentBlock} onSubmit={onSubmit} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
