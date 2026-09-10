import { TaskCard } from "./task-card";
import { sortByPriorityScore } from "@/lib/priority";
import type { Task } from "@/lib/types";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-10 text-center dark:border-zinc-700">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-8 w-8 text-zinc-300 dark:text-zinc-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h4M9 8h2m-5.5 12h9a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 14.5 4.5h-9A2.25 2.25 0 0 0 3.25 6.75v10.75A2.25 2.25 0 0 0 5.5 20Z"
        />
      </svg>
      <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
    </div>
  );
}

export function PriorityRanking({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState message="No tasks yet. Add one above — it will be ranked by (Importance × 0.7 + Urgency × 0.3) ÷ Effort." />
    );
  }

  const sorted = sortByPriorityScore(tasks);

  return (
    <ol className="flex list-none flex-col gap-2.5 p-0">
      {sorted.map((task, index) => (
        <li key={task.id} className="flex items-start gap-3">
          <span className="mt-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <TaskCard task={task} />
          </div>
        </li>
      ))}
    </ol>
  );
}
