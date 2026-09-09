import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";

type Organization = {
  id: string;
  name: string;
};

export type OrganizationMembership = Organization & {
  role: "member" | "owner";
};

export type OrganizationMember = {
  id: string;
  name: string;
  role: "member" | "owner";
};

export async function getUserMemberships(
  userId: string
): Promise<OrganizationMembership[]> {
  const supabase = await createClient();

  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId);

  if (membershipError || !memberships?.length) {
    if (membershipError) {
      console.error("Get organization memberships error:", membershipError);
    }
    return [];
  }

  const organizationIds = memberships.map((membership) => membership.organization_id);
  const { data: organizations, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name")
    .in("id", organizationIds);

  if (organizationError || !organizations) {
    if (organizationError) {
      console.error("Get organizations error:", organizationError);
    }
    return [];
  }

  const organizationById = new Map(organizations.map((organization) => [organization.id, organization]));

  return memberships.flatMap((membership) => {
    const organization = organizationById.get(membership.organization_id);
    return organization
      ? [{ ...organization, role: membership.role as "member" | "owner" }]
      : [];
  });
}

export async function getUserOrganizations(
  userId: string
): Promise<Organization[]> {
  const memberships = await getUserMemberships(userId);
  return memberships.map(({ id, name }) => ({ id, name }));
}

export async function getCurrentOrganization(
  userId: string
): Promise<Organization | null> {
  const memberships = await getUserMemberships(userId);

  if (memberships.length === 0) {
    return null;
  }

  // Check if there's an active organization ID in cookies
  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get("active_org_id")?.value;

  if (activeOrganizationId) {//if there is an active organization ID in cookies, find the organization with that ID in the organizations array and return it
    const selectedOrganization = memberships.find(
      (organization) => organization.id === activeOrganizationId//
    );

    if (selectedOrganization) {
      return selectedOrganization;
    }
  }

  return memberships[0];
}

export async function getCurrentMembership(
  userId: string
): Promise<OrganizationMembership | null> {
  const memberships = await getUserMemberships(userId);
  if (!memberships.length) {
    return null;
  }

  const cookieStore = await cookies();
  const activeOrganizationId = cookieStore.get("active_org_id")?.value;

  return (
    memberships.find((membership) => membership.id === activeOrganizationId) ??
    memberships[0]
  );
}

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  const supabase = await createClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("organization_members")
    .select("user_id, role")
    .eq("organization_id", organizationId);

  if (membershipError || !memberships?.length) {
    return [];
  }

  const userIds = memberships.map((membership) => membership.user_id);
  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, name")
    .in("id", userIds);

  if (userError || !users) {
    return [];
  }

  const usersById = new Map(users.map((user) => [user.id, user]));
  return memberships.flatMap((membership) => {
    const user = usersById.get(membership.user_id);
    return user
      ? [{ id: user.id, name: user.name, role: membership.role as "member" | "owner" }]
      : [];
  });
}