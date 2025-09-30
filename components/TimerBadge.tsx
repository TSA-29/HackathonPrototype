"use client";
import { useEffect, useState } from "react";

export default function TimerBadge({ start }: { start: number }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    setSec(0);
    const id = setInterval(() => {
      const elapsed = (performance.now() - start) / 1000;
      setSec(Math.floor(elapsed));
    }, 300);
    return () => clearInterval(id);
  }, [start]);
  return (
    <div className="rounded-xl border px-3 py-1 text-sm tabular-nums">
      ⏱ {sec}s
    </div>
  );
}
