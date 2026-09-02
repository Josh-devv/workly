import { createClient } from "@/app/lib/supabase/server";

type Organization = {
  id: string;
  name: string;
};

export async function getCurrentOrganization(): Promise<Organization | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select(`
      organization_id,
      organizations (
        id,
        name
      )
    `)
    .eq("user_id", user.id)
    .limit(1);

  if (error || !memberships || memberships.length === 0) {
    return null;
  }

  const organization = memberships[0]?.organizations;

  if (!organization) {
    return null;
  }

  return organization as unknown as Organization;
}