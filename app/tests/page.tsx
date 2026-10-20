import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import {
  getClientsForOrganization,
  type Client,
} from "@/app/lib/api/client";

export default async function TestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div>
        <h1>Session expired</h1>
        <p>Please sign in again.</p>
      </div>
    );
  }

  const membership = await getCurrentMembership(user.id);
  if (!membership) {
    return (
      <div>
        <h1>No organization</h1>
        <p>You must belong to an organization to view clients.</p>
      </div>
    );
  }

  let clients: Client[];
  try {
    clients = await getClientsForOrganization(membership.id);
  } catch (error) {
    return (
      <div>
        <h1>Client API Error</h1>
        <p>{error instanceof Error ? error.message : "Unable to load clients."}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Clients</h1>
      <pre>
        {JSON.stringify(clients, null, 2)}
      </pre>
    </div>
  );
}