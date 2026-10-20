import "server-only";

import { createClient as createSupabaseServerClient } from "@/app/lib/supabase/server";

type ErrorBody = {
  message?: unknown;
  title?: unknown;
  errors?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
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

function getErrorMessage(status: number, body: unknown): string {
  const errorBody = body && typeof body === "object" ? (body as ErrorBody) : undefined;
  const message =
    typeof errorBody?.message === "string"
      ? errorBody.message
      : getValidationMessage(errorBody?.errors) ??
        (typeof errorBody?.title === "string" ? errorBody.title : null);

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (status === 404) {
    return message || "The requested record was not found.";
  }

  if (status === 400 || status === 422) {
    return message || "Please check the submitted details and try again.";
  }

  if (status >= 500) {
    return "The service is unavailable right now. Please try again.";
  }

  return message || `The request failed (HTTP ${status}).`;
}

async function getAccessToken(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  return session.access_token;
}

async function request<T>(
  path: string,
  init: RequestInit,
  authenticated: boolean,
): Promise<T> {
  const apiUrl = process.env.WORKLY_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) {
    throw new Error("WORKLY_API_URL is not configured on the server.");
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (authenticated) {
    const accessToken = await getAccessToken();
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the service. Please try again.");
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
    throw new ApiError(getErrorMessage(response.status, responseBody), response.status);
  }

  return responseBody as T;
}

export function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(path, init, true);
}

export function publicApiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(path, init, false);
}
