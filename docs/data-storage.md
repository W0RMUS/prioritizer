# Data Storage

Data persists to `tasks.json` in the project root (gitignored) as a single
`Store` object. The file is created on the first write; a missing or invalid
file is treated as an empty store.

## Format

```json
{
  "projects": [
    {
      "id": "string (crypto.randomUUID)",
      "name": "string, 1-100 chars",
      "createdAt": "ISO timestamp"
    }
  ],
  "tasks": [
    {
      "id": "string (crypto.randomUUID)",
      "projectId": "id of the owning project",
      "name": "string, 1-200 chars",
      "urgency": 1-5,
      "importance": 1-5,
      "effort": 1-5
    }
  ]
}
```

## Validation

Input passes through the normalizers in lib/data.ts before a write:

- **Tasks** (`normalizeTaskInput`): name must be a non-empty string, trimmed
  and capped at 200 chars; urgency, importance, and effort are required
  numbers, rounded and clamped to the 1–5 scale.
- **Projects** (`normalizeProjectInput`): name must be a non-empty string,
  trimmed and capped at 100 chars.

Invalid payloads return `null` and the action throws.

## Migration

Ad-hoc migration runs on read (`migrateStore` in lib/data.ts):

- Legacy flat task arrays (pre-projects format) are wrapped into a store
  whose tasks all move into a project named "General".
- Tasks lacking `effort` (older effort-optional version) are assigned
  `effort = 3` (neutral) so nothing disappears from the ranking.
- Tasks referencing an unknown `projectId` are dropped.

## Server Actions

| File                     | Action          | Behavior                                             |
| ------------------------ | --------------- | ---------------------------------------------------- |
| `app/project-actions.ts` | `createProject` | Appends a new project with a random UUID             |
| `app/project-actions.ts` | `renameProject` | Renames the project with a matching id               |
| `app/project-actions.ts` | `deleteProject` | Removes the project **and all of its tasks**         |
| `app/task-actions.ts`    | `addTask`       | Prepends a new task to the given project             |
| `app/task-actions.ts`    | `updateTask`    | Replaces the task with a matching id                 |
| `app/task-actions.ts`    | `deleteTask`    | Removes the task with a matching id                  |

All actions revalidate `/` and `/projects/[id]` after writing. Tasks are
stored newest-first; the ranking list re-sorts by score on every render.
