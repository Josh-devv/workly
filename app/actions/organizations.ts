"use server";

import { cookies } from "next/headers";
import { apiRequest } from "@/app/lib/api/server";
import {
  getOrganizationsForUser,
  type Organization,
} from "@/app/lib/api/organizations";
import { createClient } from "@/app/lib/supabase/server";

type OrganizationResponse = {
  id: string;
  name: string;
  createdAt: string;
  created_By: string;
};

export async function createOrganization(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in to create an organization.");
  }

  const organization = await apiRequest<OrganizationResponse>("/api/Org", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const cookieStore = await cookies();
  cookieStore.set("active_org_id", organization.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  return { id: organization.id, name: organization.name };
}

export async function getMyOrganizations(): Promise<Organization[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in to load organizations.");
  }

  return getOrganizationsForUser(user.id);
}
