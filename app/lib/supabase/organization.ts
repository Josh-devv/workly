import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

type Organization = {
  id: string;
  name: string;
};

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select(`
      organization_id,
      organizations (
        id,
        name
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Get organizations error:", error);
    return [];
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  return memberships
    .flatMap((membership) => {
      const organizations = Array.isArray(membership.organizations)
        ? membership.organizations
        : membership.organizations
          ? [membership.organizations]
          : [];

      return organizations.map((organization) => organization as unknown as Organization);
    });
}

export async function getCurrentOrganization(
  userId: string
): Promise<Organization | null> {
  const organizations = await getUserOrganizations(userId);

  if (organizations.length === 0) {
    return null;
  }

  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get("active_org_id")?.value;

  if (activeOrganizationId) {
    const selectedOrganization = organizations.find(
      (organization) => organization.id === activeOrganizationId
    );

    if (selectedOrganization) {
      return selectedOrganization;
    }
  }

  return organizations[0];
}