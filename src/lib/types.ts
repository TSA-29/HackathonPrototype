export type BlockType = "fill_blank" | "multiple_choice" | "ordering";
export type Difficulty = "easy" | "medium" | "hard";

export interface BlockSpec {
  id: string;
  type: BlockType;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  payload: any;
  solution: any;
  hints: string[];
  explanation?: string;
}

export interface Session {
  id: string;
  topic: string;
  blocks: BlockSpec[];
  mode: "solo" | "versus";
  createdAt: number;
}

export interface Attempt {
  sessionId: string;
  blockId: string;
  userId: string;
  answer: any;
  correct: boolean;
  firstTry: boolean;
  hintUsed: boolean;
  timeMs: number;
  timestamp: number;
}
