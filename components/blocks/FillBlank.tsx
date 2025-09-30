"use client";
import { useState } from "react";
import type { BlockSpec } from "@/src/lib/types";

export default function FillBlank({
  block,
  onSubmit,
}: {
  block: BlockSpec;
  onSubmit: (answer: string[], meta?: { hintUsed?: boolean }) => void;
}) {
  const text = String(block.payload.textWithBlanks);
  const blanks: string[] = block.payload.blanks ?? [];
  const bank: string[] = block.payload.options ?? [];
  const [answers, setAnswers] = useState<string[]>(Array(blanks.length).fill(""));

  const rendered = text
    .split(/\[(?:BLANK_1|BLANK_2|BLANK_\d+)\]/g)
    .reduce<JSX.Element[]>((acc, chunk, idx) => {
      acc.push(<span key={`t-${idx}`}>{chunk}</span>);
      if (idx < blanks.length) {
        acc.push(
          <input
            key={`b-${idx}`}
            className="mx-2 w-40 rounded-md border px-2 py-1"
            placeholder={`blank ${idx + 1}`}
            value={answers[idx] ?? ""}
            onChange={(e) => {
              const next = [...answers];
              next[idx] = e.target.value;
              setAnswers(next);
            }}
          />
        );
      }
      return acc;
    }, []);

  return (
    <div className="space-y-4">
      <div className="text-gray-700">{rendered}</div>
      {bank.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bank.map((w, i) => (
            <button
              key={i}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => {
                const idx = answers.findIndex((a) => !a);
                if (idx !== -1) {
                  const next = [...answers];
                  next[idx] = w;
                  setAnswers(next);
                }
              }}
            >
              {w}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={answers.some((a) => !a.trim())}
          onClick={() => onSubmit(answers)}
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
