import { randomUUID } from "node:crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  SCALE_MAX,
  SCALE_MIN,
  type Project,
  type Store,
  type Task,
} from "./types";

/**
 * Resolved lazily (not at import time) so TASKS_DATA_FILE set at runtime —
 * e.g. by the systemd unit or in tests — is always honored.
 */
function dataFile(): string {
  return process.env.TASKS_DATA_FILE
    ? path.resolve(process.env.TASKS_DATA_FILE)
    : path.join(process.cwd(), "tasks.json");
}

/** Neutral default for legacy tasks saved before effort became mandatory. */
const LEGACY_EFFORT = 3;
/** Project that legacy flat-array tasks.json files migrate into. */
export const DEFAULT_PROJECT_NAME = "General";

function clamp(value: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value)));
}

/**
 * Read the full store from tasks.json.
 * Returns { projects: [], tasks: [] } if the file doesn't exist or is invalid.
 * Legacy flat task arrays are migrated into a "General" project on read.
 */
export async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(dataFile(), "utf-8");
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy flat task array: migrate and persist the new format once.
      const store = migrateStore(parsed);
      await writeStore(store);
      return store;
    }
    return migrateStore(parsed);
  } catch {
    return { projects: [], tasks: [] };
  }
}

export async function writeStore(store: Store): Promise<void> {
  await fs.writeFile(dataFile(), JSON.stringify(store, null, 2), "utf-8");
}

export async function readProjects(): Promise<Project[]> {
  return (await readStore()).projects;
}

export async function readTasksOfProject(projectId: string): Promise<Task[]> {
  const store = await readStore();
  return store.tasks.filter((t) => t.projectId === projectId);
}

/** Validates & normalizes a raw task payload. Returns null when invalid. */
export function normalizeTaskInput(input: unknown): Omit<Task, "id" | "projectId"> | null {
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

/** Validates & normalizes a raw project payload. Returns null when invalid. */
export function normalizeProjectInput(input: unknown): { name: string } | null {
  if (typeof input !== "object" || input === null) return null;
  const { name } = input as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length === 0) return null;
  return { name: name.trim().slice(0, 100) };
}

function isProject(value: unknown): value is Project {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.createdAt === "string"
  );
}

function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    (t.projectId === undefined || typeof t.projectId === "string") &&
    typeof t.name === "string" &&
    typeof t.urgency === "number" &&
    typeof t.importance === "number" &&
    (t.effort === undefined || typeof t.effort === "number")
  );
}

/** Legacy tasks may lack effort; assign a neutral value so nothing disappears. */
function migrateTask(task: Task): Task {
  return task.effort === undefined ? { ...task, effort: LEGACY_EFFORT } : task;
}

/**
 * Ad-hoc schema migration:
 * - flat task array (pre-projects format) → tasks move into a "General" project
 * - tasks with unknown projectId are dropped
 */
function migrateStore(parsed: unknown): Store {
  let projects: Project[];
  let tasks: Task[];

  if (Array.isArray(parsed)) {
    const now = new Date().toISOString();
    const general: Project = {
      id: randomUUID(),
      name: DEFAULT_PROJECT_NAME,
      createdAt: now,
    };
    projects = [general];
    tasks = parsed.filter(isTask).map((t) => ({
      ...migrateTask(t),
      projectId: general.id,
    }));
  } else if (typeof parsed === "object" && parsed !== null) {
    const { projects: p, tasks: t } = parsed as Record<string, unknown>;
    projects = Array.isArray(p) ? p.filter(isProject) : [];
    const projectIds = new Set(projects.map((proj) => proj.id));
    tasks = Array.isArray(t)
      ? t.filter(isTask).filter((t) => projectIds.has(t.projectId)).map(migrateTask)
      : [];
  } else {
    return { projects: [], tasks: [] };
  }

  return { projects, tasks };
}
