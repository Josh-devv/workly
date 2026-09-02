import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export default async function ProjeectsPage     () {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6">
        <h1>Projects</h1>
        <p>Please sign in again.</p>
        <a href="/login" className="text-[#0e5d53] underline">
          Go to login
        </a>
      </main>
    );
  }

  // Fetch projects from the database
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main>
        <h1>Projects</h1>
        <p>Unable to load projects.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Projects</h1>

      {projects.length === 0 ? (
        <p>You don't have any projects yet.</p>
      ) : (
        <div>
          {projects.map((project) => (
            <div key={project.id}>
              <h2>{project.name}</h2>

              {project.description && (
                <p>{project.description}</p>
              )}

              {project.client_email && (
                <p>{project.client_email}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}