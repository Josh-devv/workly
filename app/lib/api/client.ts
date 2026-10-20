import "server-only";

import { apiRequest } from "@/app/lib/api/server";

type ClientApiResponse = {
  id: string;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  organizationId: string;
  createdAt: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  organization_id: string;
  created_at: string;
};

export type ClientInput = {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
};

function toClient(client: ClientApiResponse): Client {
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    email: client.email,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    organization_id: client.organizationId,
    created_at: client.createdAt,
  };
}

export async function getClientsForOrganization(
  organizationId: string,
): Promise<Client[]> {
  const response = await apiRequest<unknown>("/api/Client");

  if (!Array.isArray(response)) {
    throw new Error("The client service returned an invalid client list.");
  }

  return (response as ClientApiResponse[])
    .map(toClient)
    .filter((client) => client.organization_id === organizationId)
    .sort((first, second) =>
      second.created_at.localeCompare(first.created_at),
    );
}

export async function getClientById(clientId: string): Promise<Client> {
  const response = await apiRequest<unknown>(
    `/api/Client/${encodeURIComponent(clientId)}`,
  );

  if (!response || typeof response !== "object") {
    throw new Error("The client service returned an invalid client.");
  }

  return toClient(response as ClientApiResponse);
}

export async function createClient(
  input: ClientInput,
  organizationId: string,
): Promise<Client> {
  const response = await apiRequest<unknown>("/api/Client", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      company: input.company,
      organizationId,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      notes: input.notes || null,
    }),
  });

  if (!response || typeof response !== "object" || !("id" in response)) {
    throw new Error("The client service did not return the created client ID.");
  }

  return toClient(response as ClientApiResponse);
}

export async function updateClient(
  clientId: string,
  input: ClientInput,
): Promise<Client> {
  const response = await apiRequest<unknown>(
    `/api/Client/${encodeURIComponent(clientId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        company: input.company,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
      }),
    },
  );

  if (!response || typeof response !== "object") {
    throw new Error("The client service returned an invalid updated client.");
  }

  return toClient(response as ClientApiResponse);
}

export async function deleteClient(clientId: string): Promise<void> {
  await apiRequest<unknown>(
    `/api/Client/${encodeURIComponent(clientId)}`,
    { method: "DELETE" },
  );
}
