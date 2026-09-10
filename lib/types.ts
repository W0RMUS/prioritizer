export interface Task {
  id: string;
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

export const SCALE_MIN = 1;
export const SCALE_MAX = 5;
