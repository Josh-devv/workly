"use server";

import {
  createClient as createClientApi,
  deleteClient as deleteClientApi,
  updateClient as updateClientApi,
  type ClientInput,
} from "@/app/lib/api/client";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

async function getOwnerMembership(action: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(`You must be logged in to ${action} a client.`);
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership) {
    throw new Error("You must belong to an organization to manage clients.");
  }

  if (membership.role !== "owner") {
    throw new Error(`Only workspace owners can ${action} clients.`);
  }

  return membership;
}

export async function createClientAction(data: ClientInput) {
  const membership = await getOwnerMembership("create");

  if (
    !data ||
    typeof data.name !== "string" ||
    typeof data.company !== "string" ||
    !data.name.trim() ||
    !data.company.trim()
  ) {
    throw new Error("Client name and company name are required.");
  }

  return createClientApi(data, membership.id);
}

export async function updateClientAction(
  clientId: string,
  data: ClientInput,
) {
  await getOwnerMembership("update");

  if (
    !data ||
    typeof data.name !== "string" ||
    typeof data.company !== "string" ||
    !data.name.trim() ||
    !data.company.trim()
  ) {
    throw new Error("Client name and company name are required.");
  }

  return updateClientApi(clientId, data);
}

export async function deleteClientAction(clientId: string) {
  await getOwnerMembership("delete");
  await deleteClientApi(clientId);
}
