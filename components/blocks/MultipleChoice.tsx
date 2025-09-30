"use client";
import { useState } from "react";
import type { BlockSpec } from "@/src/lib/types";

export default function MultipleChoice({
  block,
  onSubmit,
}: {
  block: BlockSpec;
  onSubmit: (answer: number, meta?: { hintUsed?: boolean }) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const choices: string[] = block.payload.choices ?? [];

  return (
    <div className="space-y-3">
      <div className="text-gray-700">{block.payload.stem}</div>
      <div className="grid gap-2">
        {choices.map((c, i) => (
          <button
            key={i}
            className={`rounded-xl border px-4 py-2 text-left hover:bg-gray-50 ${
              sel === i ? "border-black" : ""
            }`}
            onClick={() => setSel(i)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={sel === null}
          onClick={() => onSubmit(sel!)}
        >
          Submit
        </button>
        <button
          className="rounded-xl border px-4 py-2"
          onClick={() => onSubmit(block.solution, { hintUsed: true })}
          title={block.hints?.[0] ?? "Hint"}
        >
          Hint (auto-fill)
        </button>
      </div>
    </div>
  );
}
