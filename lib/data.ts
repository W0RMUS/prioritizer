import { promises as fs } from "fs";
import path from "path";
import { SCALE_MAX, SCALE_MIN, type Task } from "./types";

const DATA_FILE = path.join(process.cwd(), "tasks.json");

/** Neutral default for legacy tasks saved before effort became mandatory. */
const LEGACY_EFFORT = 3;

function clamp(value: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

/** Read all tasks from tasks.json. Returns [] if the file doesn't exist or is invalid. */
export async function readTasks(): Promise<Task[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask).map(migrateTask);
  } catch {
    return [];
  }
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

/** Validates & normalizes a raw task payload. Returns null when invalid. */
export function normalizeTaskInput(input: unknown): Omit<Task, "id"> | null {
  if (typeof input !== "object" || input === null) return null;
  const { name, urgency, importance, effort } = input as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) return null;
  if (typeof urgency !== "number" || typeof importance !== "number") return null;
  if (typeof effort !== "number") return null;

  return {
    name: name.trim().slice(0, 200),
    urgency: clamp(urgency),
    importance: clamp(importance),
    effort: clamp(effort),
  };
}

/** Legacy tasks may lack effort; assign a neutral value so nothing disappears. */
function migrateTask(task: Task): Task {
  return task.effort === undefined ? { ...task, effort: LEGACY_EFFORT } : task;
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.urgency === "number" &&
    typeof t.importance === "number" &&
    (t.effort === undefined || typeof t.effort === "number")
  );
}
