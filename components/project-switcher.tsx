"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createProject,
  deleteProject,
  renameProject,
} from "@/app/project-actions";
import type { Project } from "@/lib/types";

type Mode = "idle" | "creating" | "renaming";

export function ProjectSwitcher({
  projects,
  activeId,
}: {
  projects: Project[];
  activeId: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [name, setName] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setMode("idle");
    setName("");
    setError(null);
  };

  const submitName = () => {
    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "creating") {
          const project = await createProject({ name: name.trim() });
          reset();
          router.push(`/projects/${project.id}`);
        } else if (mode === "renaming") {
          await renameProject(activeId, { name: name.trim() });
          reset();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    startTransition(async () => {
      try {
        await deleteProject(activeId);
        router.push("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  };

  const beginCreate = () => {
    setName("");
    setMode("creating");
  };

  const beginRename = (current: string) => {
    setName(current);
    setMode("renaming");
  };

  const active = projects.find((p) => p.id === activeId);
  if (!active) return null;

  return (
    <nav
      aria-label="Projects"
      className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800"
    >
      {projects.map((project) =>
        project.id === activeId && mode === "renaming" ? (
          <NameInput
            key={project.id}
            id={`rename-${project.id}`}
            value={name}
            pending={isPending}
            error={error}
            submitLabel="Save"
            autoFocus
            onChange={(v) => {
              setName(v);
              setError(null);
            }}
            onSubmit={submitName}
            onCancel={reset}
          />
        ) : (
          <div
            key={project.id}
            className="flex items-center gap-0.5 rounded-lg pr-1"
          >
            <Link
              href={`/projects/${project.id}`}
              aria-current={project.id === activeId ? "page" : undefined}
              className={`h-9 rounded-lg px-4 text-sm font-medium leading-9 transition-colors ${
                project.id === activeId
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              } ${isPending ? "opacity-50" : ""}`}
            >
              {project.name}
            </Link>
            {project.id === activeId && mode === "idle" && (
              <span className="flex items-center">
                {confirmingDelete ? (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isPending}
                      className="h-8 rounded-lg px-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      {isPending ? "…" : "Confirm delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="h-8 rounded-lg px-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <IconButton
                      label={`Rename ${project.name}`}
                      disabled={isPending}
                      onClick={() => {
                        setError(null);
                        beginRename(project.name);
                      }}
                    >
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.919c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                    </IconButton>
                    <IconButton
                      label={`Delete ${project.name}`}
                      disabled={isPending}
                      danger
                      onClick={() => setConfirmingDelete(true)}
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.842-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.489.075l.376 4.703a.75.75 0 0 1-1.494.119l-.328-4.102a38.9 38.9 0 0 0-2.086 0l-.328 4.102a.75.75 0 0 1-1.494-.119L7.511 4.075C8.327 4.025 9.16 4 10 4Z"
                        clipRule="evenodd"
                      />
                    </IconButton>
                  </>
                )}
              </span>
            )}
          </div>
        ),
      )}

      {mode === "creating" ? (
        <NameInput
          id="new-project"
          value={name}
          pending={isPending}
          error={error}
          submitLabel="Create"
          autoFocus
          onChange={(v) => {
            setName(v);
            setError(null);
          }}
          onSubmit={submitName}
          onCancel={reset}
        />
      ) : (
        <button
          type="button"
          onClick={beginCreate}
          disabled={isPending}
          className="h-9 rounded-lg border border-dashed border-zinc-300 px-3 text-sm font-medium text-zinc-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          + New project
        </button>
      )}
    </nav>
  );
}

function IconButton({
  label,
  disabled,
  danger,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors ${
        danger
          ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
          : "hover:bg-zinc-100 hover:text-indigo-600 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
      } disabled:opacity-50`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-3.5 w-3.5"
      >
        {children}
      </svg>
    </button>
  );
}

function NameInput({
  id,
  value,
  pending,
  error,
  submitLabel,
  autoFocus,
  onChange,
  onSubmit,
  onCancel,
}: {
  id: string;
  value: string;
  pending: boolean;
  error: string | null;
  submitLabel: string;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col"
    >
      <div className="flex gap-1.5">
        <input
          id={id}
          type="text"
          value={value}
          autoFocus={autoFocus}
          maxLength={100}
          disabled={pending}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Project name"
          className="h-9 w-48 rounded-lg border border-indigo-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
