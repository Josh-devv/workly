"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import { ApiError, apiRequest } from "@/app/lib/api/server";
import { getClientById } from "@/app/lib/api/client";
import type { Project } from "@/app/lib/api/projects";

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
    if (!(error instanceof ApiError && error.status === 404)) {
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

  return apiRequest<Project>("/api/Project", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationId: membership.id,
      clientId: input.client_id,
      name: input.name,
      description: input.description ?? "",
      status: input.status,
      rateType: input.rateType,
      rate: input.rate,
      startDate: input.startDate || null,
      deadline: input.deadline || null,
    }),
  });
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

  return apiRequest<Project>(`/api/Project/${encodeURIComponent(projectId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationId: membership.id,
      clientId: input.client_id,
      name: input.name,
      description: input.description ?? "",
      status: input.status,
      rateType: input.rateType,
      rate: input.rate ?? null,
      startDate: input.startDate || null,
      deadline: input.deadline || null,
    }),
  });
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in to delete a project.");

  const membership = await getCurrentMembership(user.id);
  if (!membership || membership.role !== "owner") {
    throw new Error("Only workspace owners can delete projects.");
  }

  await apiRequest<unknown>(`/api/Project/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
}