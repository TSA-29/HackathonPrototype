"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { v4 as uuid } from "uuid";

const modes = [
  { id: "solo" as const, label: "Solo Lesson", description: "Generate an adaptive session just for you." },
  { id: "versus" as const, label: "Multiplayer", description: "Host a room and race friends in real time." },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<typeof modes[number]["id"]>("solo");
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();

  const start = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    const id = uuid();
    const base = `/session/${id}?topic=${encodeURIComponent(trimmedTopic)}`;

    if (mode === "versus") {
      const name = displayName.trim() || "Host";
      router.push(`${base}&mode=versus&name=${encodeURIComponent(name)}`);
      return;
    }

    router.push(base);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">AI Interactive Session</h1>
          <p className="text-sm text-gray-600">
            Choose how you want to learn, then enter a topic to let the AI build your lesson.
          </p>
        </header>

        <section className="rounded-2xl border p-6 space-y-6 bg-white shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {modes.map((option) => {
              const active = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition focus:outline-none focus:ring ${
                    active
                      ? "border-black bg-black text-white shadow"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <p className={`text-xs mt-1 ${active ? "text-gray-200" : "text-gray-600"}`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <form onSubmit={start} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring"
                placeholder="e.g., Introduction to eigenvectors"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            {mode === "versus" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Display name</label>
                <input
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring"
                  placeholder="How teammates will see you"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  After hosting, share the session link or room ID with friends so they can join from the multiplayer menu.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-xl px-5 py-3 bg-black text-white disabled:opacity-50"
                disabled={!topic.trim()}
              >
                {mode === "versus" ? "Host Multiplayer" : "Start Solo"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/room")}
                className="rounded-xl border px-5 py-3"
              >
                Join Multiplayer Room
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

