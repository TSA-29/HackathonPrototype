import { create } from "zustand";
import type { Session, Attempt, BlockSpec } from "./types";

interface State {
  session?: Session;
  currentIndex: number;
  attempts: Attempt[];
  setSession: (s: Session) => void;
  next: () => void;
  prev: () => void;
  addAttempt: (a: Attempt) => void;
  insertRemedial: (b: BlockSpec) => void;
}

export const useSession = create<State>((set, get) => ({
  session: undefined,
  currentIndex: 0,
  attempts: [],
  setSession: (s) => set({ session: s, currentIndex: 0, attempts: [] }),
  next: () =>
    set((st) => ({
      currentIndex: Math.min(st.currentIndex + 1, Math.max((st.session?.blocks.length ?? 1) - 1, 0)),
    })),
  prev: () => set((st) => ({ currentIndex: Math.max(st.currentIndex - 1, 0) })),
  addAttempt: (a) => set((st) => ({ attempts: [...st.attempts, a] })),
  insertRemedial: (b) => {
    const s = get().session;
    if (!s) return;
    const newBlocks = [...s.blocks];
    newBlocks.splice(get().currentIndex + 1, 0, b);
    set({ session: { ...s, blocks: newBlocks } });
  },
}));
