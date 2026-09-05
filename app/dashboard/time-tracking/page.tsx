import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";
import TaskTrackingBoard from "./task-tracking-board";

export default async function TaskTrackingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const organization = await getCurrentOrganization(user.id);
  if (!organization) redirect("/dashboard/setup");

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", organization.id)
    .order("name");
  const projectIds = (projects ?? []).map((project) => project.id);
  const { data: tasks, error: tasksError } = projectIds.length
    ? await supabase.from("tasks").select("id, title, description, status, due_date, assigned_to, project_id").in("project_id", projectIds).order("due_date")
    : { data: [], error: null };
  const { data: memberships, error: membersError } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", organization.id);
  const memberIds = (memberships ?? []).map((membership) => membership.user_id);
  const { data: users, error: usersError } = memberIds.length
    ? await supabase.from("users").select("id, name").in("id", memberIds).order("name")
    : { data: [], error: null };

  if (projectsError || tasksError || membersError || usersError) {
    return <main className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700">Unable to load task tracking data.</main>;
  }

  return (
    <main className="space-y-6">
      <header className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/80 to-[#f1faf7]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">Task tracking</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Deadlines and delivery</h1>
        <p className="mt-2 text-sm text-slate-600">See who owns each task, what is due, and what has been completed.</p>
      </header>
      <TaskTrackingBoard
        tasks={tasks ?? []}
        assignees={(users ?? []).map((member) => ({ id: member.id, name: member.name }))}
        projectNames={Object.fromEntries((projects ?? []).map((project) => [project.id, project.name]))}
      />
    </main>
  );
}
