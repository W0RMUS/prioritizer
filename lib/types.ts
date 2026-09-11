export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

/** Payload accepted by project create/rename server actions. */
export interface ProjectDraft {
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  urgency: number;
  importance: number;
  effort: number;
}

/** Payload accepted by add/update server actions. */
export interface TaskDraft {
  name: string;
  urgency: number;
  importance: number;
  effort: number;
}

/** Top-level shape persisted in tasks.json. */
export interface Store {
  projects: Project[];
  tasks: Task[];
}

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;
