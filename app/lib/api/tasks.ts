import "server-only";

import { apiRequest } from "@/app/lib/api/server";

type TaskResponse = {
  id: string;
  title: string;
  projectId: string;
  description: string;
  status: string | null;
  priority: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  completedAt: string | null;
};

export type Task = {
  id: string;
  title: string;
  project_id: string;
  description: string;
  status: string;
  priority: string | null;
  due_date: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  completed_at: string | null;
};

function toTask(task: TaskResponse): Task {
  return {
    id: task.id,
    title: task.title,
    project_id: task.projectId,
    description: task.description,
    status: task.status ?? "todo",
    priority: task.priority,
    due_date: task.dueDate?.slice(0, 10) ?? "",
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    assigned_to: task.assignedTo,
    completed_at: task.completedAt,
  };
}

export async function getTasks(): Promise<Task[]> {
  const response = await apiRequest<TaskResponse[]>("/api/Task");
  if (!Array.isArray(response)) {
    throw new Error("The task service returned an invalid task list.");
  }

  return response.map(toTask);
}

export async function getTaskById(taskId: string): Promise<Task> {
  const response = await apiRequest<TaskResponse>(
    `/api/Task/${encodeURIComponent(taskId)}`,
  );
  return toTask(response);
}

export async function createTaskRequest(input: {
  projectId: string;
  title: string;
  description?: string;
  status: string;
  dueDate: string;
  assignedTo: string;
}): Promise<Task> {
  const response = await apiRequest<TaskResponse>("/api/Task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return toTask(response);
}

export async function updateTaskRequest(
  taskId: string,
  input: {
    projectId: string;
    title: string;
    description?: string;
    status: string;
    dueDate: string;
    assignedTo: string;
  },
): Promise<Task> {
  const response = await apiRequest<TaskResponse>(
    `/api/Task/${encodeURIComponent(taskId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return toTask(response);
}

export async function updateTaskStatusRequest(
  taskId: string,
  status: string,
): Promise<void> {
  await apiRequest<unknown>(
    `/api/Task/${encodeURIComponent(taskId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export async function deleteTaskRequest(taskId: string): Promise<void> {
  await apiRequest<unknown>(`/api/Task/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
  });
}
