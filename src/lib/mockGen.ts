import { v4 as uuid } from "uuid";
import type { BlockSpec, Difficulty, BlockType } from "./types";

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]}

export function mkBlock(topic: string, type: BlockType, difficulty: Difficulty): BlockSpec {
  const id = uuid();

  if (type === "fill_blank") {
    const base = `${topic} often involves [BLANK_1] and [BLANK_2] as key ideas.`;
    const blanks = ["definition", "procedure"];
    const options = ["definition","procedure","matrix","vector","context","example"];
    return {
      id, type, topic, difficulty,
      prompt: "Fill in the blanks in the statement.",
      payload: { textWithBlanks: base, blanks, options },
      solution: ["definition","procedure"],
      hints: ["Think about the two most basic components.", "One is 'what it is', the other is 'how to do it'."],
      explanation: `At a high level, ${topic} includes knowing what it is and how to apply it.`,
    };
  }

  if (type === "multiple_choice") {
    const stem = `Which option is most central to ${topic}?`;
    const choices = [
      `${topic} definition`,
      `Unrelated concept`,
      `Random distractor`,
      `Formatting detail`
    ];
    const correctIndex = 0;
    return {
      id, type, topic, difficulty,
      prompt: "Choose the best answer.",
      payload: { stem, choices },
      solution: correctIndex,
      hints: ["Focus on the core meaning.", "Eliminate irrelevant options first."],
      explanation: `The definition anchors understanding before details in ${topic}.`,
    };
  }

  // ordering
  const items = [
    `Identify the goal in ${topic}`,
    `List key terms`,
    `Apply a simple example`,
    `Check the result`,
    `Reflect and summarize`
  ];
  return {
    id, type, topic, difficulty,
    prompt: "Arrange the steps in the correct order.",
    payload: { items },
    solution: [0,1,2,3,4],
    hints: ["Start from purpose before details.", "End with checking and summarizing."],
    explanation: `A generic learning flow for ${topic} goes goal → terms → example → check → summarize.`,
  };
}

export function mkRemedial(topic: string, type: BlockType): BlockSpec {
  const b = mkBlock(topic, type, "easy");
  // Slight tweak to nudge clarity
  b.hints = [
    "Use the hint before answering.",
    ...(b.hints ?? [])
  ];
  b.explanation = (b.explanation ?? "") + " Think of this as a simpler recap.";
  return b;
}
