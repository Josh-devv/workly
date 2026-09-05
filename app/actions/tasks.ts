"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import { isTaskStatus, type TaskStatus } from "@/app/lib/task-status";

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
  assignedTo: string;
}

export async function createTask(input: CreateTaskInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create a task.");
  }

  const organization = await getCurrentOrganization(user.id);

  if (!organization) {
    throw new Error("No organization found.");
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

  const { data: assignee, error: assigneeError } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organization.id)
    .eq("user_id", input.assignedTo)
    .single();

  if (assigneeError || !assignee) {
    throw new Error("Selected assignee is not a member of this organization.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.projectId)
    .eq("organization_id", organization.id)
    .single();

  if (projectError || !project) {
    throw new Error("Selected project not found.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: project.id,
      title: input.title,
      description: input.description || null,
      status: input.status,
      due_date: input.dueDate,
      assigned_to: input.assignedTo,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to update a task.");
  }

  if (!isTaskStatus(status)) {
    throw new Error("Invalid task status.");
  }

  const organization = await getCurrentOrganization(user.id);

  if (!organization) {
    throw new Error("No organization found.");
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("project_id, status")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", task.project_id)
    .eq("organization_id", organization.id)
    .single();

  if (projectError || !project) {
    throw new Error("Task not found.");
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}