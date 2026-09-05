import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

type Organization = {
  id: string;
  name: string;
};

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {//creates a a function that returns an array of organizations that the user is a member of, it takes in a userId as a parameter and returns an array of organizations that the user is a member of
  const supabase = await createClient();

  const { data: memberships, error } = await supabase
    .from("organization_members") //we cna do the organization(id, name) Because theres a relationship between them....and also give me information about the related organization.
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
      const organizations = Array.isArray(membership.organizations)//convert to array regardless of whether it's a single object or an array, so that we can map over it and return an array of organizations
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

  // Check if there's an active organization ID in cookies
  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get("active_org_id")?.value;

  if (activeOrganizationId) {//if there is an active organization ID in cookies, find the organization with that ID in the organizations array and return it
    const selectedOrganization = organizations.find(
      (organization) => organization.id === activeOrganizationId//
    );

    if (selectedOrganization) {
      return selectedOrganization;
    }
  }

  return organizations[0];
}