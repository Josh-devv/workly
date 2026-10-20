import "server-only";

import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

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

type ApiErrorBody = {
  message?: unknown;
  title?: unknown;
  errors?: unknown;
};

export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

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

function getValidationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") {
    return null;
  }

  const messages = Object.values(errors).flatMap((value) =>
    Array.isArray(value)
      ? value.filter((message): message is string => typeof message === "string")
      : typeof value === "string"
        ? [value]
        : [],
  );

  return messages.length ? messages.join(" ") : null;
}

function getApiErrorMessage(status: number, body: unknown): string {
  const errorBody =
    body && typeof body === "object" ? (body as ApiErrorBody) : undefined;
  const message =
    typeof errorBody?.message === "string"
      ? errorBody.message
      : getValidationMessage(errorBody?.errors) ??
        (typeof errorBody?.title === "string" ? errorBody.title : null);

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to access this organization.";
  }

  if (status === 404) {
    return message || "Client not found.";
  }

  if (status === 400 || status === 422) {
    return message || "Please check the client details and try again.";
  }

  if (status >= 500) {
    return "The client service is unavailable right now. Please try again.";
  }

  return message || `The client request failed (HTTP ${status}).`;
}

async function getAccessToken(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new ClientApiError(
      "Your session has expired. Please sign in again.",
      401,
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ClientApiError(
      "Your session has expired. Please sign in again.",
      401,
    );
  }

  return session.access_token;
}

async function requestClientApi(path: string, init: RequestInit = {}) {
  const apiUrl = process.env.WORKLY_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) {
    throw new Error("WORKLY_API_URL is not configured on the server.");
  }

  const accessToken = await getAccessToken();
  let response: Response;

  try {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${accessToken}`);

    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the client service. Please try again.");
  }

  const responseText = await response.text();
  let responseBody: unknown;

  if (responseText) {
    try {
      responseBody = JSON.parse(responseText) as unknown;
    } catch {
      responseBody = responseText;
    }
  }

  if (!response.ok) {
    throw new ClientApiError(
      getApiErrorMessage(response.status, responseBody),
      response.status,
    );
  }

  return responseBody;
}

export async function getClientsForOrganization(
  organizationId: string,
): Promise<Client[]> {
  const response = await requestClientApi("/api/Client");

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
  const response = await requestClientApi(
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
  const response = await requestClientApi("/api/Client", {
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
  const response = await requestClientApi(
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
  await requestClientApi(
    `/api/Client/${encodeURIComponent(clientId)}`,
    { method: "DELETE" },
  );
}
