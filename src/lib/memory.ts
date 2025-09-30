import type { Attempt, BlockSpec, Session } from "./types";

export const sessions = new Map<string, Session>();
export const attempts = new Map<string, Attempt[]>(); // key = sessionId

export function setSession(s: Session) {
  sessions.set(s.id, s);
}
export function getSession(id: string) {
  return sessions.get(id);
}
export function addAttempt(a: Attempt) {
  const list = attempts.get(a.sessionId) ?? [];
  list.push(a);
  attempts.set(a.sessionId, list);
}
export function getAttempts(sessionId: string) {
  return attempts.get(sessionId) ?? [];
}
