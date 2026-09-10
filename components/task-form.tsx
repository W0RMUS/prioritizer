"use client";

import { useState, useTransition } from "react";
import { ScaleButtonGroup } from "./scale-button-group";
import type { TaskDraft } from "@/lib/draft";
import type { Task } from "@/lib/types";

interface TaskFormProps {
  initial?: Task;
  submitLabel?: string;
  onSubmit: (draft: TaskDraft) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({
  initial,
  submitLabel = "Add Task",
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [urgency, setUrgency] = useState(initial?.urgency ?? 3);
  const [importance, setImportance] = useState(initial?.importance ?? 3);
  const [effort, setEffort] = useState(initial?.effort ?? 3);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a task name.");
      return;
    }
    setError(null);
    const draft: TaskDraft = {
      name: name.trim(),
      urgency,
      importance,
      effort,
    };
    startTransition(async () => {
      try {
        await onSubmit(draft);
        if (!initial) {
          setName("");
          setUrgency(3);
          setImportance(3);
          setEffort(3);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor={`task-name-${initial?.id ?? "new"}`}
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Task name
        </label>
        <input
          id={`task-name-${initial?.id ?? "new"}`}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="e.g. Prepare quarterly report"
          maxLength={200}
          className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-5">
        <ScaleButtonGroup
          label="Urgency"
          value={urgency}
          onChange={setUrgency}
          accent="blue"
          disabled={isPending}
        />
        <ScaleButtonGroup
          label="Importance"
          value={importance}
          onChange={setImportance}
          accent="orange"
          disabled={isPending}
        />
        <div>
          <ScaleButtonGroup
            label="Effort"
            value={effort}
            onChange={setEffort}
            accent="emerald"
            disabled={isPending}
          />
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            1 = trivial, 5 = very large
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 flex-1 rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
