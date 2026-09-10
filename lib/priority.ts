import type { Task } from "./types";

export const IMPORTANCE_WEIGHT = 0.7;
export const URGENCY_WEIGHT = 0.3;

/**
 * WSJF-style priority: weighted value divided by effort.
 * Value = (Importance * 0.7) + (Urgency * 0.3). Range 0.4-5.
 */
export function priorityScore(task: Task): number {
  const value = task.importance * IMPORTANCE_WEIGHT + task.urgency * URGENCY_WEIGHT;
  return value / task.effort;
}

export function sortByPriorityScore(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => priorityScore(b) - priorityScore(a));
}
