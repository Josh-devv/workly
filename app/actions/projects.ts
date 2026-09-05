"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";

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

  const organization = await getCurrentOrganization(user.id);

  if (!organization) {
    throw new Error("No organization found.");
  }

  
  const { data: existingClient, error: clientError } = await supabase
    .from("clients")
    .select("name")
    .eq("organization_id", organization.id)
    .eq("id", input.client_id)//fetch the client name from the database using the client_id provided in the input
    .single();

  if (!existingClient) {
    throw new Error("Selected client not found.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: organization.id, // comes from the SERVER, not the form
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