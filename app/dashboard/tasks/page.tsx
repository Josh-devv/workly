import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import TaskForm from "./task-form";

export default async function TasksPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="p-6">
        <h1>Tasks</h1>
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

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, client_id")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name", { ascending: true });

  if (projectsError || clientsError) {
    console.error("Fetch task relationships error:", projectsError ?? clientsError);

    return (
      <main className="rounded-[28px] border border-[#cfe1d8] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        <p className="mt-2 text-slate-600">Unable to load projects and clients.</p>
      </main>
    );
  }

  const projectIds = (projects ?? []).map((project) => project.id);
  const { data: tasks, error: tasksError } = projectIds.length
    ? await supabase
        .from("tasks")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (tasksError) {
    return (
      <main>
        <h1>Tasks</h1>
        <p>Unable to load tasks.</p>
      </main>
    );
  }

  const clientNames = new Map((clients ?? []).map((client) => [client.id, client.name]));
  const projectOptions = (projects ?? []).map((project) => ({
    id: project.id,
    name: project.name,
    clientName: clientNames.get(project.client_id) ?? "Unknown client",
  }));
  const projectDetails = new Map(
    projectOptions.map((project) => [project.id, project]),
  );

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
            {tasks.length} tasks
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Task directory</h2>
            <span className="text-sm text-slate-500">
              {tasks.length === 0 ? "No tasks yet" : `${tasks.length} total`}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#cfe1d8] bg-[#f5faf8] p-8 text-center">
              <p className="text-lg font-medium text-slate-900">No tasks in this workspace yet</p>
              <p className="mt-2 text-sm text-slate-600">Add a task and assign it to a project.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const project = projectDetails.get(task.project_id);

                return (
                  <div key={task.id} className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{task.name}</p>
                      {task.description ? <p className="mt-1 text-sm text-slate-600">{task.description}</p> : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#0e5d53]">
                      <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">
                        {project?.name ?? "Unknown project"}
                      </span>
                      <span className="text-slate-500">{project?.clientName ?? "Unknown client"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <h2 className="text-xl font-semibold text-slate-900">Add task</h2>
          <p className="mt-2 text-sm text-slate-600">Create a task under a project and its connected client.</p>
          <div className="mt-5">
            <TaskForm projects={projectOptions} />
          </div>
        </aside>
      </div>
    </main>
  );
}