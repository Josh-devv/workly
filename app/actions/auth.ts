"use server";

import { getCurrentOrganization } from "@/app/lib/supabase/organization";

export async function getUserOrganization() {
  return await getCurrentOrganization();
}