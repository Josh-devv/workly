import "server-only";

import { apiRequest } from "@/app/lib/api/server";

type OrganizationResponse = {
  id: string;
  name: string;
  createdAt: string;
  created_By: string;
};

type MembershipResponse = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  name: string;
  createdAt: string;
};

export type Organization = {
  id: string;
  name: string;
};

export type OrganizationMembership = Organization & {
  role: "member" | "owner" | "admin";
};

export type OrganizationMember = {
  id: string;
  name: string;
  role: "member" | "owner" | "admin";
};

type OrganizationRole = OrganizationMembership["role"];

function isOrganizationRole(role: string): role is OrganizationRole {
  return role === "member" || role === "owner" || role === "admin";
}

async function getOrganizations(): Promise<OrganizationResponse[]> {
  const organizations = await apiRequest<OrganizationResponse[]>("/api/Org");
  if (!Array.isArray(organizations)) {
    throw new Error("The organization service returned invalid data.");
  }
  return organizations;
}

async function getMemberships(): Promise<MembershipResponse[]> {
  const memberships =
    await apiRequest<MembershipResponse[]>("/api/OrgMember");
  if (!Array.isArray(memberships)) {
    throw new Error("The membership service returned invalid data.");
  }
  return memberships;
}

export async function getUserMemberships(
  userId: string,
): Promise<OrganizationMembership[]> {
  const [organizations, memberships] = await Promise.all([
    getOrganizations(),
    getMemberships(),
  ]);
  const organizationsById = new Map(
    organizations.map((organization) => [organization.id, organization]),
  );

  return memberships.flatMap((membership) => {
    if (membership.userId !== userId) {
      return [];
    }
    const organization = organizationsById.get(membership.organizationId);
    if (!organization) {
      return [];
    }
    if (!isOrganizationRole(membership.role)) {
      throw new Error("The membership service returned an unsupported role.");
    }
    return [
      {
        id: organization.id,
        name: organization.name,
        role: membership.role,
      },
    ];
  });
}

export async function getOrganizationsForUser(
  userId: string,
): Promise<Organization[]> {
  return (await getUserMemberships(userId)).map(({ id, name }) => ({
    id,
    name,
  }));
}

export async function getMembersForOrganization(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const memberships = await getMemberships();
  return memberships
    .filter((membership) => membership.organizationId === organizationId)
    .map((membership) => {
      if (!isOrganizationRole(membership.role)) {
        throw new Error("The membership service returned an unsupported role.");
      }
      return {
        id: membership.userId,
        name: membership.name || "Workspace member",
        role: membership.role,
      };
    });
}
