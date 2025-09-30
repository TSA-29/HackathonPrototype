import type { BlockSpec } from "./types";

export function isCorrect(block: BlockSpec, answer: any) {
  if (block.type === "multiple_choice") {
    return Number(answer) === Number(block.solution);
  }
  if (block.type === "fill_blank") {
    const norm = (s: string) => String(s ?? "").trim().toLowerCase();
    const got = Array.isArray(answer) ? answer.map(norm) : [];
    const sol = Array.isArray(block.solution) ? block.solution.map(norm) : [];
    return got.length === sol.length && got.every((v, i) => v === sol[i]);
  }
  if (block.type === "ordering") {
    // answer: indices array describing current order
    const got = Array.isArray(answer) ? answer.map(Number) : [];
    const sol = Array.isArray(block.solution) ? block.solution.map(Number) : [];
    return got.length === sol.length && got.every((v, i) => v === sol[i]);
  }
  return false;
}
