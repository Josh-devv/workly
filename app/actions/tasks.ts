"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";

interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
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
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}