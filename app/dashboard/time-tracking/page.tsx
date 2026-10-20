import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import {
  getCurrentOrganization,
  getOrganizationMembers,
} from "@/app/lib/supabase/organization";
import TaskTrackingBoard from "./task-tracking-board";
import { getProjectsForOrganization } from "@/app/lib/api/projects";
import { getTasks } from "@/app/lib/api/tasks";

export default async function TaskTrackingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const organization = await getCurrentOrganization(user.id);
  if (!organization) redirect("/dashboard/setup");

  let projects;
  let tasks;
  let users;
  try {
    [projects, tasks, users] = await Promise.all([
      getProjectsForOrganization(organization.id),
      getTasks(),
      getOrganizationMembers(organization.id),
    ]);
  } catch {
    return <main className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700">Unable to load task tracking data.</main>;
  }

  const projectIds = new Set(projects.map((project) => project.id));
  const visibleTasks = tasks
    .filter((task) => projectIds.has(task.project_id))
    .sort((first, second) => first.due_date.localeCompare(second.due_date));

  return (
    <main className="space-y-6">
      <header className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/80 to-[#f1faf7]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">Task tracking</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Deadlines and delivery</h1>
        <p className="mt-2 text-sm text-slate-600">See who owns each task, what is due, and what has been completed.</p>
      </header>
      <TaskTrackingBoard
        tasks={visibleTasks}
        assignees={users.map((member) => ({ id: member.id, name: member.name }))}
        projectNames={Object.fromEntries(projects.map((project) => [project.id, project.name]))}
      />
    </main>
  );
}
