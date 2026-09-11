"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { normalizeProjectInput, readStore, writeStore } from "@/lib/data";
import type { Project } from "@/lib/types";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/projects/[id]", "page");
}

export async function createProject(input: unknown): Promise<Project> {
  const data = normalizeProjectInput(input);
  if (!data) throw new Error("Invalid project data");

  const store = await readStore();
  const project = {
    id: randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  await writeStore({
    projects: [...store.projects, project],
    tasks: store.tasks,
  });

  revalidate();
  return project;
}

export async function renameProject(id: string, input: unknown): Promise<void> {
  const data = normalizeProjectInput(input);
  if (!data) throw new Error("Invalid project data");

  const store = await readStore();
  const project = store.projects.find((p) => p.id === id);
  if (!project) throw new Error("Project not found");

  project.name = data.name;
  await writeStore(store);
  revalidate();
}

/** Deletes a project and all of its tasks. */
export async function deleteProject(id: string): Promise<void> {
  const store = await readStore();
  if (!store.projects.some((p) => p.id === id)) {
    throw new Error("Project not found");
  }

  await writeStore({
    projects: store.projects.filter((p) => p.id !== id),
    tasks: store.tasks.filter((t) => t.projectId !== id),
  });
  revalidate();
}
