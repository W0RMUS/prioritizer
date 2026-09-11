# Architecture

## Stack

- Next.js (App Router) with TypeScript
- Tailwind CSS v4
- Server Actions + `fs` for persistence — no external database

## Project structure

```
app/
  project-actions.ts      # Server Actions: createProject, renameProject, deleteProject
  task-actions.ts         # Server Actions: addTask, updateTask, deleteTask (scoped to a project)
  page.tsx                # Redirects to the first project; empty state when none exist
  projects/[id]/page.tsx  # Server component: loads one project and its tasks
  layout.tsx              # Root layout (Geist fonts, metadata)
  globals.css             # Tailwind entry + body styling
components/
  project-switcher.tsx    # Top-bar tabs: switch/create/rename/delete projects
  empty-projects.tsx      # Create-first-project form for the empty state
  add-task-card.tsx       # Card wrapper wiring the form to the addTask action
  task-form.tsx           # Add/edit form (client): name input + 1-5 button groups
  scale-button-group.tsx  # Reusable 1-5 button group with color accents
  task-card.tsx           # Display card with inline edit and delete
  rankings.tsx            # PriorityRanking list + empty state
lib/
  types.ts                # Project, Task, drafts, Store and scale bounds
  priority.ts             # Score formula and sorting
  data.ts                 # tasks.json read/write, validation, migration
tasks.json                # Data store (gitignored), created on first write
```

## Data flow

1. `app/page.tsx` (server component) loads `tasks.json`. If projects exist it
   redirects to `/projects/<first-id>`, otherwise it renders the empty state.
2. `app/projects/[id]/page.tsx` loads the store and renders the project's
   tasks; unknown project ids return 404 via `notFound()`.
3. `ProjectSwitcher` renders one tab per project; switching is a plain link
   navigation, so the selected project is simply the URL.
4. `PriorityRanking` sorts the project's tasks with `sortByPriorityScore` and
   renders `TaskCard`s.
5. Mutations go through Server Actions in `app/project-actions.ts` and
   `app/task-actions.ts`:
   - Client components call them inside `useTransition`.
   - Actions validate/normalize input (`normalizeProjectInput` /
     `normalizeTaskInput`), read the file, mutate the store, and write it
     back with `writeStore`.
   - `revalidatePath` targets `/` and `/projects/[id]` so all pages re-render
     with fresh data.

## UI conventions

- Mobile-first, card-based layout; single-column stack, two-column grid on large screens.
- Color coding: urgency = blue, importance = orange, effort = emerald, score = indigo.
- Dark mode via Tailwind's `dark:` variants and `prefers-color-scheme`.
- Empty states when no projects or no tasks exist.
- Deleting the active project redirects to the first remaining project (or
  the empty state if none are left).
