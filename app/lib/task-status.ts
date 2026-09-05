export const TASK_STATUSES = ["todo", "in-progress", "completed"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export function isTaskStatus(status: string): status is TaskStatus {
  return TASK_STATUSES.includes(status as TaskStatus);
}
