"use server";

import { cookies } from "next/headers";

import { apiRequest, ApiError, publicApiRequest } from "@/app/lib/api/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import { createClient } from "@/app/lib/supabase/server";

type InvitationResponse = {
  id: string;
  organizationId: string;
  email: string;
  role: "member" | "admin";
  status: string | null;
  invitedBy: string;
  expiresAt: string | null;
  createdAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
};

type InvitationLookupResponse = {
  organizationName: string;
  email: string;
  role: "member" | "admin";
  status: string;
  expiresAt: string | null;
};

type InvitationCreatedResponse = {
  invitation: InvitationResponse;
  token: string;
};

export type PendingInvitation = {
  email: string;
  role: "member" | "admin";
  expires_at: string;
};

interface InviteMemberInput {
  email: string;
  role: "member" | "admin";
}

export async function inviteMember(input: InviteMemberInput) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to invite a member.");
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership) {
    throw new Error("No organization found.");
  }

  if (!input.email.trim()) {
    throw new Error("An email address is required.");
  }

  if (input.role === "admin" && membership.role !== "owner") {
    throw new Error("Only workspace owners can invite administrators.");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const result = await apiRequest<InvitationCreatedResponse>(
    "/api/OrgInvitation",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: membership.id,
        email: input.email.toLowerCase().trim(),
        role: input.role,
        expiresAt: expiresAt.toISOString(),
      }),
    },
  );

  return { ...result.invitation, token: result.token };
}

export async function getInvitation(token: string) {
  try {
    const invitation = await publicApiRequest<InvitationLookupResponse>(
      `/api/OrgInvitation/token/${encodeURIComponent(token)}`,
    );

    return {
      organization_name: invitation.organizationName,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expiresAt,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Sign in before accepting this invitation." };
  }

  try {
    const result = await apiRequest<{
      organizationName: string;
      organizationId: string;
    }>(
      `/api/OrgInvitation/token/${encodeURIComponent(token)}/accept`,
      { method: "POST" },
    );
    const cookieStore = await cookies();
    cookieStore.set("active_org_id", result.organizationId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return { error: null, organizationName: result.organizationName };
  } catch (acceptError) {
    return {
      error:
        acceptError instanceof Error
          ? acceptError.message
          : "Unable to accept invitation.",
    };
  }
}

export async function getPendingInvitations(
  organizationId: string,
): Promise<PendingInvitation[]> {
  const invitations =
    await apiRequest<InvitationResponse[]>("/api/OrgInvitation");
  if (!Array.isArray(invitations)) {
    throw new Error("The invitation service returned invalid data.");
  }

  return invitations
    .filter(
      (invitation) =>
        invitation.organizationId === organizationId &&
        invitation.status === "pending" &&
        invitation.expiresAt !== null &&
        new Date(invitation.expiresAt) > new Date(),
    )
    .map((invitation) => ({
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expiresAt!,
    }));
}
