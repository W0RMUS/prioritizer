"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { normalizeTaskInput, readTasks, writeTasks } from "@/lib/data";
import type { Task } from "@/lib/types";

export async function addTask(input: unknown): Promise<Task> {
  const data = normalizeTaskInput(input);
  if (!data) throw new Error("Invalid task data");

  const tasks = await readTasks();
  const task: Task = { id: randomUUID(), ...data };
  await writeTasks([task, ...tasks]);

  revalidatePath("/");
  return task;
}

export async function updateTask(id: string, input: unknown): Promise<Task> {
  const data = normalizeTaskInput(input);
  if (!data) throw new Error("Invalid task data");

  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Task not found");

  tasks[index] = { id, ...data };
  await writeTasks(tasks);

  revalidatePath("/");
  return tasks[index];
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await readTasks();
  await writeTasks(tasks.filter((t) => t.id !== id));
  revalidatePath("/");
}
