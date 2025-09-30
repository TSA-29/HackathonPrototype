import { z } from "zod";

export const PlanReq = z.object({
  topic: z.string().min(3).max(200),
});

export const GenerateReq = z.object({
  topic: z.string().min(3).max(200),
  block: z.object({
    type: z.enum(["fill_blank","multiple_choice","ordering"]),
    difficulty: z.enum(["easy","medium","hard"])
  })
});

export const AdaptReq = z.object({
  topic: z.string().min(3).max(200),
  currentBlockType: z.enum(["fill_blank","multiple_choice","ordering"])
});

export const SummaryQuery = z.object({
  id: z.string().min(1)
});
