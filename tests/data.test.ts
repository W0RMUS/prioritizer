import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_PROJECT_NAME,
  normalizeProjectInput,
  normalizeTaskInput,
  readStore,
  writeStore,
} from "@/lib/data";
import type { Store } from "@/lib/types";

describe("normalizeTaskInput", () => {
  it("accepts and clamps a valid payload", () => {
    expect(normalizeTaskInput({ name: " Write docs ", urgency: 2, importance: 9, effort: 0 })).toEqual({
      name: "Write docs",
      urgency: 2,
      importance: 5,
      effort: 1,
    });
  });

  it("truncates long names to 200 characters", () => {
    const result = normalizeTaskInput({ name: "x".repeat(300), urgency: 3, importance: 3, effort: 3 });
    expect(result?.name).toHaveLength(200);
  });

  it("rejects invalid payloads", () => {
    expect(normalizeTaskInput(null)).toBeNull();
    expect(normalizeTaskInput("task")).toBeNull();
    expect(normalizeTaskInput({ name: "  ", urgency: 3, importance: 3, effort: 3 })).toBeNull();
    expect(normalizeTaskInput({ name: "No numbers", urgency: "high", importance: 3, effort: 3 })).toBeNull();
    expect(normalizeTaskInput({ name: "Missing effort", urgency: 3, importance: 3 })).toBeNull();
  });
});

describe("normalizeProjectInput", () => {
  it("trims and accepts a valid name", () => {
    expect(normalizeProjectInput({ name: "  Home  " })).toEqual({ name: "Home" });
  });

  it("enforces the 100 character limit", () => {
    const result = normalizeProjectInput({ name: "y".repeat(150) });
    expect(result?.name).toHaveLength(100);
  });

  it("rejects invalid payloads", () => {
    expect(normalizeProjectInput(null)).toBeNull();
    expect(normalizeProjectInput(42)).toBeNull();
    expect(normalizeProjectInput({ name: "" })).toBeNull();
  });
});

describe("readStore", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "prioritizer-test-"));
    process.env.TASKS_DATA_FILE = path.join(dataDir, "tasks.json");
  });

  afterEach(async () => {
    delete process.env.TASKS_DATA_FILE;
    await rm(dataDir, { recursive: true, force: true });
  });

  it("returns an empty store when the data file is missing", async () => {
    await expect(readStore()).resolves.toEqual({ projects: [], tasks: [] });
  });

  it("returns an empty store when the data file is invalid JSON", async () => {
    await writeFileHelper("not json at all");
    await expect(readStore()).resolves.toEqual({ projects: [], tasks: [] });
  });

  it("returns an empty store for unexpected JSON shapes", async () => {
    await writeFileHelper(JSON.stringify({ nonsense: true }));
    await expect(readStore()).resolves.toEqual({ projects: [], tasks: [] });
  });

  it("migrates a legacy flat task array into a General project", async () => {
    await writeFileHelper(
      JSON.stringify([
        { id: "t-legacy", name: "Legacy task", urgency: 4, importance: 2 },
        { id: "t-broken", name: 123, urgency: 1, importance: 1 },
      ]),
    );

    const store = await readStore();

    expect(store.projects).toHaveLength(1);
    expect(store.projects[0].name).toBe(DEFAULT_PROJECT_NAME);
    expect(store.tasks).toHaveLength(1);
    expect(store.tasks[0]).toMatchObject({
      id: "t-legacy",
      projectId: store.projects[0].id,
      name: "Legacy task",
      urgency: 4,
      importance: 2,
      effort: 3,
    });
  });

  it("drops tasks whose projectId references an unknown project", async () => {
    const now = new Date().toISOString();
    await writeFileHelper(
      JSON.stringify({
        projects: [{ id: "p-real", name: "Real", createdAt: now }],
        tasks: [
          { id: "t-good", projectId: "p-real", name: "Good", urgency: 3, importance: 3, effort: 2 },
          { id: "t-orphan", projectId: "p-ghost", name: "Orphan", urgency: 3, importance: 3, effort: 2 },
        ],
      }),
    );

    const store = await readStore();
    expect(store.tasks.map((t) => t.id)).toEqual(["t-good"]);
  });
});

describe("writeStore + readStore round-trip", () => {
  let dataDir: string;

  beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "prioritizer-test-"));
    process.env.TASKS_DATA_FILE = path.join(dataDir, "tasks.json");
  });

  afterEach(async () => {
    delete process.env.TASKS_DATA_FILE;
    await rm(dataDir, { recursive: true, force: true });
  });

  it("persists a store to TASKS_DATA_FILE and reads it back unchanged", async () => {
    const dataFile = process.env.TASKS_DATA_FILE;
    const store: Store = {
      projects: [{ id: "p-1", name: "Home", createdAt: "2026-09-12T10:00:00.000Z" }],
      tasks: [
        { id: "t-1", projectId: "p-1", name: "Fix fence", urgency: 4, importance: 3, effort: 5 },
        { id: "t-2", projectId: "p-1", name: "Water plants", urgency: 2, importance: 2, effort: 1 },
      ],
    };

    await writeStore(store);

    const raw = await readFile(dataFile!, "utf-8");
    expect(JSON.parse(raw)).toEqual(store);
    await expect(readStore()).resolves.toEqual(store);
  });
});

async function writeFileHelper(content: string): Promise<void> {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(process.env.TASKS_DATA_FILE!, content, "utf-8");
}
