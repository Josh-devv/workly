import { cookies } from "next/headers";
import {
  getMembersForOrganization,
  getUserMemberships as getMembershipsFromApi,
  type Organization,
  type OrganizationMember,
  type OrganizationMembership,
} from "@/app/lib/api/organizations";

//the reason for using cookies here is to get the active organization ID from the cookies,
//  which is used to determine the current organization or membership for the user. 
// This allows the application to remember the user's selected organization across 
// different sessions and requests.


export type { Organization, OrganizationMembership, OrganizationMember };

export async function getUserMemberships(
  userId: string
): Promise<OrganizationMembership[]> {
  return getMembershipsFromApi(userId);
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
  return getMembersForOrganization(organizationId);
}