"use client";

import { useState, useTransition } from "react";
import { deleteTask, updateTask } from "@/app/task-actions";
import { priorityScore } from "@/lib/priority";
import { TaskForm } from "./task-form";
import type { Task } from "@/lib/types";

export function TaskCard({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const score = priorityScore(task);

  const handleDelete = () => {
    startDelete(async () => {
      try {
        await deleteTask(task.id);
      } catch {
        // Task may already be gone; refresh state is handled by revalidatePath
      }
    });
  };

  if (editing) {
    return (
      <div className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm dark:border-indigo-900 dark:bg-zinc-900">
        <TaskForm
          initial={task}
          submitLabel="Save Changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (draft) => {
            await updateTask(task.id, draft);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {task.name}
        </h3>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label={`Edit ${task.name}`}
            onClick={() => setEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.919c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Delete ${task.name}`}
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.842-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.489.075l.376 4.703a.75.75 0 0 1-1.494.119l-.328-4.102a38.9 38.9 0 0 0-2.086 0l-.328 4.102a.75.75 0 0 1-1.494-.119L7.511 4.075C8.327 4.025 9.16 4 10 4Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatBadge label="U" value={task.urgency} color="blue" />
        <StatBadge label="I" value={task.importance} color="orange" />
        <StatBadge label="E" value={task.effort} color="emerald" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Score {score.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "orange" | "emerald";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${colors[color]}`}
    >
      <span className="opacity-60">{label}</span>
      {value}
    </span>
  );
}
