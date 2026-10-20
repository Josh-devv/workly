"use server";

import { createClient } from "@/app/lib/supabase/server";
import {
  getCurrentMembership,
  getCurrentOrganization,
} from "@/app/lib/supabase/organization";
import { isTaskStatus, type TaskStatus } from "@/app/lib/task-status";
import {
  createTaskRequest,
  deleteTaskRequest,
  getTaskById,
  updateTaskRequest,
  updateTaskStatusRequest,
} from "@/app/lib/api/tasks";
import { getProjectById } from "@/app/lib/api/projects";

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

async function getSignedInUser(message: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error(message);
  }

  return user;
}

export async function createTask(input: CreateTaskInput) {
  const user = await getSignedInUser("You must be signed in to create a task.");
  const membership = await getCurrentMembership(user.id);

  if (!membership) {
    throw new Error("No organization found.");
  }

  if (membership.role !== "owner") {
    throw new Error("Only workspace owners can create tasks.");
  }

  if (!isTaskStatus(input.status)) {
    throw new Error("Invalid task status.");
  }

  if (!input.dueDate) {
    throw new Error("A due date is required.");
  }

  if (!input.assignedTo) {
    throw new Error("Assign this task to a team member.");
  }

  const project = await getProjectById(input.projectId);
  if (project.organization_id !== membership.id) {
    throw new Error("Selected project not found.");
  }

  return createTaskRequest(input);
}

export async function updateTaskStatus(taskId: string, status: string) {
  const user = await getSignedInUser("You must be signed in to update a task.");

  if (!isTaskStatus(status)) {
    throw new Error("Invalid task status.");
  }

  const organization = await getCurrentOrganization(user.id);
  if (!organization) {
    throw new Error("No organization found.");
  }

  const task = await getTaskById(taskId);
  const project = await getProjectById(task.project_id);
  if (project.organization_id !== organization.id) {
    throw new Error("Task not found.");
  }

  await updateTaskStatusRequest(taskId, status);
}

type UpdateTaskInput = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
};

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const user = await getSignedInUser("You must be signed in to update a task.");

  if (!isTaskStatus(input.status)) {
    throw new Error("Invalid task status.");
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can edit tasks.");
  }

  const task = await getTaskById(taskId);
  const project = await getProjectById(task.project_id);
  if (project.organization_id !== membership.id) {
    throw new Error("Task not found.");
  }

  return updateTaskRequest(taskId, {
    projectId: task.project_id,
    title: input.title,
    description: input.description,
    status: input.status,
    dueDate: input.dueDate,
    assignedTo: input.assignedTo,
  });
}

export async function deleteTask(taskId: string) {
  const user = await getSignedInUser("You must be signed in to delete a task.");
  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can delete tasks.");
  }

  const task = await getTaskById(taskId);
  const project = await getProjectById(task.project_id);
  if (project.organization_id !== membership.id) {
    throw new Error("Task not found.");
  }

  await deleteTaskRequest(taskId);
}
