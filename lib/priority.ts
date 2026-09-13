import type { Task } from "./types";

const IMPORTANCE_WEIGHT = 0.7;
const URGENCY_WEIGHT = 0.3;
/** Softens the effort penalty: divisor is effort^α (α=0.5 → √effort). */
const EFFORT_EXPONENT = 0.5;

/**
 * WSJF-style priority with a softened effort divisor.
 * Value = (Importance * 0.7) + (Urgency * 0.3), divided by effort^0.5.
 * High-effort work is penalized less than a pure division would, so long
 * running strategic tasks are not buried beneath tiny chores.
 */
export function priorityScore(task: Task): number {
  const value = task.importance * IMPORTANCE_WEIGHT + task.urgency * URGENCY_WEIGHT;
  return value / Math.pow(task.effort, EFFORT_EXPONENT);
}

export function sortByPriorityScore(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => priorityScore(b) - priorityScore(a));
}
