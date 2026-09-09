"use server";

import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import crypto from "crypto";

interface InviteMemberInput {
  email: string;
  role: "member" | "owner";
}

export async function inviteMember(input: InviteMemberInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to invite a member.");
  }

  const organization = await getCurrentOrganization(user.id);

  if (!organization) {
    throw new Error("No organization found.");
  }

  if (!input.email.trim()) {
    throw new Error("An email address is required.");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organization.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || (input.role === "owner" && membership.role !== "owner")) {
    throw new Error("You do not have permission to send this invitation.");
  }

  // Generate a secure random token for the invite link
  const token = crypto.randomBytes(32).toString("hex");

  // Invitation expires in 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({
      organization_id: organization.id,
      email: input.email.toLowerCase().trim(),
      role: input.role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getInvitation(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_organization_invitation", {//this is a stored procedure in supabase that retrieves the invitation details based on the token
    invitation_token: token,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in before accepting this invitation." };
  }

  const { data, error } = await supabase.rpc("accept_organization_invitation", {//this is a stored procedure in supabase that accepts the invitation and adds the user to the organization
    invitation_token: token,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null, organizationName: data?.[0]?.organization_name ?? null };
}

export async function getPendingInvitations(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_pending_organization_invitations", {
    target_organization_id: organizationId,
  });

  if (error) {
    console.error("Get pending invitations error:", error);
    return [];
  }

  return (data ?? []) as Array<{
    email: string;
    role: "member" | "owner";
    expires_at: string;
  }>;
}