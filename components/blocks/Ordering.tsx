"use client";
import { useState } from "react";
import type { BlockSpec } from "@/src/lib/types";

export default function Ordering({
  block,
  onSubmit,
}: {
  block: BlockSpec;
  onSubmit: (answer: number[], meta?: { hintUsed?: boolean }) => void;
}) {
  // keep items with their original indices so answer can be [indices in current order]
  const items: string[] = block.payload.items ?? [];
  const [order, setOrder] = useState(items.map((_, i) => i));

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setOrder(next);
  };

  return (
    <div className="space-y-3">
      <ul className="grid gap-2">
        {order.map((origIdx, i) => (
          <li key={origIdx} className="flex items-center gap-2 rounded-xl border p-2">
            <span className="w-6 text-center text-sm text-gray-500">{i + 1}</span>
            <span className="flex-1">{items[origIdx]}</span>
            <div className="flex gap-1">
              <button className="rounded border px-2 py-1" onClick={() => move(i, -1)}>
                ↑
              </button>
              <button className="rounded border px-2 py-1" onClick={() => move(i, 1)}>
                ↓
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          className="rounded-xl bg-black px-4 py-2 text-white"
          onClick={() => onSubmit(order)}
        >
          Submit
        </button>
        <button
          className="rounded-xl border px-4 py-2"
          onClick={() => onSubmit(block.solution, { hintUsed: true })}
          title={block.hints?.[0] ?? "Hint"}
        >
          Hint (auto-order)
        </button>
      </div>
    </div>
  );
}
