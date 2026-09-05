import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import ProjectList from "@/app/components/projects/project-list";
import NewProjectForm from "./projects-form";

export default async function ProjectsPage() {
  const supabase = await createClient();

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

  const organization = await getCurrentOrganization(user.id);

  if (!organization) {
    redirect("/dashboard/setup");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch projects error:", error);

    return (
      <main className="rounded-[28px] border border-[#cfe1d8] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
        <p className="mt-2 text-slate-600">Unable to load projects.</p>
      </main>
    );
  }


  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("*")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

    console.log("CLIENTS FETCHED:", clients);
  if (clientsError) {
    console.error("Fetch clients error:", clientsError);

    return (
      <main className="rounded-[28px] border border-[#cfe1d8] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
        <p className="mt-2 text-slate-600">Unable to load clients.</p>
      </main>
    );
  }
  return (
    <main className="space-y-6">
      <header className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/80 to-[#f1faf7]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
              Organization
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">
              {organization.name}
            </h1>
          </div>

          <div className="rounded-full border border-[#cfe1d8] bg-[#f1faf7] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
            {projects?.length ?? 0} projects
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Project directory</h2>
            <span className="text-sm text-slate-500">
              {projects.length === 0 ? "No projects yet" : `${projects.length} total`}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#cfe1d8] bg-[#f5faf8] p-8 text-center">
              <p className="text-lg font-medium text-slate-900">No projects in this workspace yet</p>
              <p className="mt-2 text-sm text-slate-600">
                Add your first project to start managing tasks and work.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectList key={project.id} project={project} clients={clients ?? []} />//
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <h2 className="text-xl font-semibold text-slate-900">Add project</h2>
          <p className="mt-2 text-sm text-slate-600">
            Create a new project record for this organization.
          </p>
          <div className="mt-5">
            <NewProjectForm clients={clients ?? []} />
          </div>
        </aside>
      </div>
    </main>
  );
}