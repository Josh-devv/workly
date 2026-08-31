import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default async function ClientsPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch clients from the database
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
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
        <p>You don't have any clients yet.</p>
      ) : (
        <div>
          {clients.map((client) => (
            <div key={client.id}>
              <h2>{client.name}</h2>

              {client.company && (
                <p>{client.company}</p>
              )}

              {client.email && (
                <p>{client.email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}