# Prioritizer

A local task prioritization app. Tasks are ranked by value per unit of effort:

```
Score = (Importance × 0.7 + Urgency × 0.3) ÷ √Effort
```

All inputs are on a 1–5 scale. Data persists to `tasks.json` in the project root.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Usage

1. Enter a task name.
2. Set **Urgency** (blue), **Importance** (orange), and **Effort** (green) on their 1–5 button groups.
3. Add the task — it appears ranked in the **Priority Ranking** list (highest score first).
4. Edit a task with the pencil icon; delete with the trash icon.

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Production build             |
| `npm run start` | Run the production build     |
| `npm run lint`  | Lint the codebase            |

## Documentation

- [docs/architecture.md](docs/architecture.md) — stack, structure, and data flow
- [docs/scoring.md](docs/scoring.md) — the priority formula and rationale
- [docs/data-storage.md](docs/data-storage.md) — `tasks.json` format and persistence
