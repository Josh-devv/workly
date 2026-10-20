import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership } from "@/app/lib/supabase/organization";
import TaskForm from "./task-form";
import TaskRow from "./task-row";
import {
  getClientsForOrganization,
  type Client,
} from "@/app/lib/api/client";
import { getProjectsForOrganization } from "@/app/lib/api/projects";
import { getTasks } from "@/app/lib/api/tasks";
import { getOrganizationMembers } from "@/app/lib/supabase/organization";

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

  const membership = await getCurrentMembership(user.id);

  if (!membership) {
    redirect("/dashboard/setup");
  }

  const organization = membership;

  let clients: Client[];
  try {
    clients = await getClientsForOrganization(organization.id);
    clients.sort((first, second) => first.name.localeCompare(second.name));
  } catch (error) {
    return (
      <main className="rounded-[28px] border border-[#cfe1d8] bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        <p className="mt-2 text-slate-600">
          {error instanceof Error ? error.message : "Unable to load clients."}
        </p>
      </main>
    );
  }

  let projects;
  let tasks;
  let users;
  try {
    [projects, tasks, users] = await Promise.all([
      getProjectsForOrganization(organization.id),
      getTasks(),
      getOrganizationMembers(organization.id),
    ]);
    projects.sort((first, second) => first.name.localeCompare(second.name));
    users.sort((first, second) => first.name.localeCompare(second.name));
  } catch (error) {

    return (
      <main className="rounded-[28px] border border-[#cfe1d8] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        <p className="mt-2 text-slate-600">
          {error instanceof Error ? error.message : "Unable to load tasks and projects."}
        </p>
      </main>
    );
  }

  const projectIds = new Set(projects.map((project) => project.id));
  const visibleTasks = tasks
    .filter((task) => projectIds.has(task.project_id))
    .filter((task) => membership.role === "owner" || task.assigned_to === user.id)
    .sort((first, second) => second.created_at.localeCompare(first.created_at));

  const clientNames = new Map(clients.map((client) => [client.id, client.name]));
  const projectOptions = projects.map((project) => ({
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
            {visibleTasks.length} tasks
          </div>
        </div>
      </header>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Task directory</h2>
            <span className="text-sm text-slate-500">
              {visibleTasks.length === 0 ? "No tasks yet" : `${visibleTasks.length} total`}
            </span>
          </div>

          {visibleTasks.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#cfe1d8] bg-[#f5faf8] p-8 text-center">
              <p className="text-lg font-medium text-slate-900">No tasks in this workspace yet</p>
              <p className="mt-2 text-sm text-slate-600">Add a task and assign it to a project.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.map((task) => {
                const project = projectDetails.get(task.project_id);

                const assignee = users.find((user) => user.id === task.assigned_to);
                return <TaskRow key={task.id} task={task} projectName={project?.name ?? "Unknown project"} clientName={project?.clientName ?? "Unknown client"} assigneeName={assignee?.name ?? "Unassigned"} members={users.map((member) => ({ id: member.id, name: member.name }))} canEdit={membership.role === "owner"} />;
              })}
            </div>
          )}
        </section>

        {membership.role === "owner" ? <aside className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <h2 className="text-xl font-semibold text-slate-900">Add task</h2>
          <p className="mt-2 text-sm text-slate-600">Create a task under a project and its connected client.</p>
          <div className="mt-5">
            <TaskForm projects={projectOptions} members={users.map((member) => ({ id: member.id, name: member.name }))} />
          </div>
        </aside> : null}
      </div>
    </main>
  );
}