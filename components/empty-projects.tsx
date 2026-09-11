"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProject } from "@/app/project-actions";

export function EmptyProjects() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const project = await createProject({ name: name.trim() });
        router.push(`/projects/${project.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  return (
    <section className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-10 w-10 text-zinc-300 dark:text-zinc-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a4.5 4.5 0 0 0-6.36 0L3.56 8.21a4.5 4.5 0 0 0 0 6.36l5.27 5.27a4.5 4.5 0 0 0 6.36 0l4.51-4.51a4.5 4.5 0 0 0 0-6.36L18.5 7.77"
        />
      </svg>
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          No projects yet
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Create a project first — each project has its own prioritized task
          list.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Project name"
          maxLength={100}
          className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-11 shrink-0 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create Project"}
        </button>
      </form>
      {error && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  );
}
