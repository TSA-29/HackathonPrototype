"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/src/lib/useSocket";

export default function RoomPage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const socket = useSocket();

  const join = () => {
    if (!roomId || !name || !socket) return;
    socket.emit("joinRoom", { roomId, name });
    router.push(`/session/${roomId}?topic=multiplayer&mode=versus&name=${encodeURIComponent(name)}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Join Multiplayer Room</h1>
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={join}
          className="w-full rounded-xl bg-black px-4 py-2 text-white"
        >
          Join
        </button>
      </div>
    </main>
  );
}
