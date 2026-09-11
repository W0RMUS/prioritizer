"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { normalizeTaskInput, readStore, writeStore } from "@/lib/data";
import type { Task } from "@/lib/types";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/projects/[id]", "page");
}

export async function addTask(projectId: string, input: unknown): Promise<Task> {
  const data = normalizeTaskInput(input);
  if (!data) throw new Error("Invalid task data");

  const store = await readStore();
  if (!store.projects.some((p) => p.id === projectId)) {
    throw new Error("Project not found");
  }

  const task: Task = { id: randomUUID(), projectId, ...data };
  await writeStore({ ...store, tasks: [task, ...store.tasks] });

  revalidate();
  return task;
}

export async function updateTask(id: string, input: unknown): Promise<Task> {
  const data = normalizeTaskInput(input);
  if (!data) throw new Error("Invalid task data");

  const store = await readStore();
  const index = store.tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Task not found");

  store.tasks[index] = { ...store.tasks[index], ...data };
  await writeStore(store);

  revalidate();
  return store.tasks[index];
}

export async function deleteTask(id: string): Promise<void> {
  const store = await readStore();
  await writeStore({ ...store, tasks: store.tasks.filter((t) => t.id !== id) });
  revalidate();
}
