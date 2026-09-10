# Data Storage

Tasks persist to `tasks.json` in the project root (gitignored). The file is
created on the first write; a missing or invalid file is treated as an empty
list.

## Format

```json
[
  {
    "id": "string (crypto.randomUUID)",
    "name": "string, 1-200 chars",
    "urgency": 1-5,
    "importance": 1-5,
    "effort": 1-5
  }
]
```

## Validation

All input passes through `normalizeTaskInput` (lib/data.ts) before a write:

- name must be a non-empty string, trimmed and capped at 200 chars
- urgency, importance, and effort are required numbers, rounded and
  clamped to the 1–5 scale
- invalid payloads return `null` and the action throws

## Migration

Older task entries may lack `effort` (from a previous effort-optional
version). On read, `readTasks` assigns them `effort = 3` (neutral) so
nothing disappears from the ranking.

## Server Actions (app/actions.ts)

| Action       | Behavior                                        |
| ------------ | ----------------------------------------------- |
| `addTask`    | Prepends a new task with a random UUID          |
| `updateTask` | Replaces the task with a matching id            |
| `deleteTask` | Removes the task with a matching id             |

All actions revalidate `/` after writing. Tasks are stored newest-first; the
ranking list re-sorts by score on every render.
