import { redirect } from "next/navigation";
import { EmptyProjects } from "@/components/empty-projects";
import { readStore } from "@/lib/data";

export default async function Home() {
  const { projects } = await readStore();

  if (projects.length > 0) {
    redirect(`/projects/${projects[0].id}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Prioritizer
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Rank tasks by value per unit of effort, per project.
        </p>
      </header>

      <main className="flex flex-col gap-8">
        <EmptyProjects />
      </main>
    </div>
  );
}
