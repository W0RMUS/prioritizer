"use client";

import { addTask } from "@/app/actions";
import { TaskForm } from "./task-form";
import type { TaskDraft } from "@/lib/types";

export function AddTaskCard() {
  const handleSubmit = async (draft: TaskDraft) => {
    await addTask(draft);
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Add a task
      </h2>
      <TaskForm onSubmit={handleSubmit} submitLabel="Add Task" />
    </section>
  );
}
