"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import {
  ClientApiError,
  getClientById,
} from "@/app/lib/api/client";

interface CreateProjectInput {
  client_id: string;
  name: string;
  description?: string;
  status: string;
  rateType: string;
  rate?: number;
  startDate?: string;
  deadline?: string;
 
}

async function ensureClientBelongsToOrganization(
  clientId: string,
  organizationId: string,
) {
  try {
    const client = await getClientById(clientId);
    if (client.organization_id === organizationId) {
      return;
    }
  } catch (error) {
    if (!(error instanceof ClientApiError && error.status === 404)) {
      throw error;
    }
  }

  throw new Error("Selected client not found.");
}
 
export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create a project.");
  }

  const membership = await getCurrentMembership(user.id);

  if (!membership) {
    throw new Error("No organization found.");
  }

  if (membership.role !== "owner") {
    throw new Error("Only workspace owners can create projects.");
  }

  
  await ensureClientBelongsToOrganization(input.client_id, membership.id);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: membership.id, // comes from the SERVER, not the form
      client_id: input.client_id,
      name: input.name,
      description: input.description,
      status: input.status,
      rate_type: input.rateType,
      rate: input.rate,
      start_date: input.startDate,
      deadline: input.deadline,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProject(projectId: string, input: CreateProjectInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in to update a project.");

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can update projects.");
  }

  await ensureClientBelongsToOrganization(input.client_id, membership.id);

  const { data, error } = await supabase
    .from("projects")
    .update({
      client_id: input.client_id,
      name: input.name,
      description: input.description || null,
      status: input.status,
      rate_type: input.rateType,
      rate: input.rate ?? null,
      start_date: input.startDate || null,
      deadline: input.deadline || null,
    })
    .eq("id", projectId)
    .eq("organization_id", membership.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in to delete a project.");

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can delete projects.");
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("organization_id", membership.id);

  if (error) throw new Error(error.message);
}