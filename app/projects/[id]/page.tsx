import { notFound } from "next/navigation";
import { AddTaskCard } from "@/components/add-task-card";
import { PriorityRanking } from "@/components/rankings";
import { ProjectSwitcher } from "@/components/project-switcher";
import { readStore } from "@/lib/data";
import type { Task } from "@/lib/types";

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const store = await readStore();
  const project = store.projects.find((p) => p.id === id);
  if (!project) notFound();

  const tasks: Task[] = store.tasks.filter((t) => t.projectId === id);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Prioritizer
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Rank tasks by value per unit of effort, per project.
        </p>
      </header>

      <main className="flex flex-col gap-8">
        <ProjectSwitcher projects={store.projects} activeId={id} />

        <div className="grid items-start gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AddTaskCard projectId={id} />
          </div>
          <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm dark:border-indigo-950 dark:bg-zinc-900 lg:col-span-3">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Priority Ranking
              </h2>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                (Importance × 0.7 + Urgency × 0.3) ÷ Effort
              </span>
            </div>
            <PriorityRanking tasks={tasks} />
          </section>
        </div>
      </main>
    </div>
  );
}
