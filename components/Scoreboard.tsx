"use client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type Entry = { userId: string; score: number };

export default function Scoreboard({ socket, roomId }: { socket: Socket | null; roomId: string }) {
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket) return;
    socket.on("scoreUpdate", ({ userId, correct }) => {
      setScores((prev) => {
        const delta = correct ? 1 : 0;
        return { ...prev, [userId]: (prev[userId] ?? 0) + delta };
      });
    });
    socket.on("system", (msg) => {
      console.log("[system]", msg);
    });
    return () => {
      socket.off("scoreUpdate");
      socket.off("system");
    };
  }, [socket]);

  return (
    <div className="rounded-xl border px-3 py-1 text-sm bg-white shadow">
      <h4 className="font-medium mb-1">Scoreboard</h4>
      {Object.entries(scores).length === 0 && <p className="text-gray-500">No scores yet</p>}
      <ul className="space-y-1">
        {Object.entries(scores).map(([name, val]) => (
          <li key={name} className="flex justify-between">
            <span>{name}</span>
            <span className="font-semibold">{val}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
