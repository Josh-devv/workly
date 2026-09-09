"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";

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

  
  const { data: existingClient, error: clientError } = await supabase
    .from("clients")
    .select("name")
    .eq("organization_id", membership.id)
    .eq("id", input.client_id)//fetch the client name from the database using the client_id provided in the input
    .single();

    
  if (!existingClient) {
    throw new Error("Selected client not found.");
  }

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

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", input.client_id)
    .eq("organization_id", membership.id)
    .single();

  if (!client) throw new Error("Selected client not found.");

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