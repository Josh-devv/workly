import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import ClientForm from "./client-form";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import ClientList from "@/app/components/clients/client-list";

export default async function ClientsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const organization = await getCurrentOrganization();

  if (!organization) {
    redirect("/dashboard/setup");
  }

  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch clients error:", error);

    return (
      <main>
        <h1>Clients</h1>
        <p>Unable to load clients.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Clients</h1>

      {clients.length === 0 ? (
        <div>
          <p>You don&apos;t have any clients yet.</p>
          <ClientForm />
        </div>
      ) : (
        <div>
          {clients.map((client) => (
            <ClientList key={client.id} client={client} />
          ))}

          <ClientForm />
        </div>
      )}
    </main>
  );
}