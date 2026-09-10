# Architecture

## Stack

- Next.js (App Router) with TypeScript
- Tailwind CSS v4
- Server Actions + `fs` for persistence — no external database

## Project structure

```
app/
  actions.ts              # Server Actions: addTask, updateTask, deleteTask
  page.tsx                # Server component: loads tasks, renders UI
  layout.tsx              # Root layout (Geist fonts, metadata)
  globals.css             # Tailwind entry + body styling
components/
  add-task-card.tsx       # Card wrapper wiring the form to the addTask action
  task-form.tsx           # Add/edit form (client): name input + 1-5 button groups
  scale-button-group.tsx  # Reusable 1-5 button group with color accents
  task-card.tsx           # Display card with inline edit and delete
  rankings.tsx            # PriorityRanking list + empty state
lib/
  types.ts                # Task, TaskDraft interfaces and scale bounds
  priority.ts             # Score formula and sorting
  data.ts                 # tasks.json read/write, validation, migration
tasks.json                # Data store (gitignored), created on first write
```

## Data flow

1. `app/page.tsx` (server component) calls `readTasks()` to load `tasks.json`.
2. `PriorityRanking` sorts tasks with `sortByPriorityScore` and renders `TaskCard`s.
3. Mutations go through Server Actions in `app/actions.ts`:
   - Client components call them inside `useTransition`.
   - Actions validate/normalize input with `normalizeTaskInput`, read the file,
     mutate the array, and write it back with `writeTasks`.
   - `revalidatePath("/")` re-renders the page with fresh data.

## UI conventions

- Mobile-first, card-based layout; single-column stack, two-column grid on large screens.
- Color coding: urgency = blue, importance = orange, effort = emerald, score = indigo.
- Dark mode via Tailwind's `dark:` variants and `prefers-color-scheme`.
- Empty states when no tasks exist.
