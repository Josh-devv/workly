"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/app/actions/tasks";
import { TASK_STATUSES } from "@/app/lib/task-status";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string;
  assigned_to: string | null;
  project_id: string;
};

type Props = {
  tasks: Task[];
  assignees: { id: string; name: string }[];
  projectNames: Record<string, string>;
};

const label = (status: string) => status === "todo" ? "To do" : status === "in-progress" ? "In progress" : "Completed";
const today = () => new Date().toISOString().slice(0, 10);

export default function TaskTrackingBoard({ tasks, assignees, projectNames }: Props) {
  const [filter, setFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [error, setError] = useState("");
  const router = useRouter();
  const currentDate = today();
  const dueSoonDateValue = new Date(`${currentDate}T00:00:00Z`);
  dueSoonDateValue.setUTCDate(dueSoonDateValue.getUTCDate() + 7);
  const dueSoonDate = dueSoonDateValue.toISOString().slice(0, 10);

  const assigneeNames = useMemo(() => Object.fromEntries(assignees.map((person) => [person.id, person.name])), [assignees]);
  const filteredTasks = tasks.filter((task) => {
    const overdue = task.status !== "completed" && task.due_date < currentDate;
    const dueSoon = task.status !== "completed" && task.due_date >= currentDate && task.due_date <= dueSoonDate;
    const matchesFilter = filter === "all" || (filter === "overdue" && overdue) || (filter === "due-soon" && dueSoon) || (filter === "completed" && task.status === "completed");
    return matchesFilter && (assigneeFilter === "all" || task.assigned_to === assigneeFilter);
  });

  async function changeStatus(taskId: string, status: string) {
    setError("");
    try {
      await updateTaskStatus(taskId, status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task.");
    }
  }

  const overdueCount = tasks.filter((task) => task.status !== "completed" && task.due_date < currentDate).length;
  const dueSoonCount = tasks.filter((task) => task.status !== "completed" && task.due_date >= currentDate && task.due_date <= dueSoonDate).length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setFilter("overdue")} className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left"><p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-700">Overdue</p><p className="mt-1 text-2xl font-semibold text-rose-900">{overdueCount}</p></button>
        <button type="button" onClick={() => setFilter("due-soon")} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left"><p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-700">Due this week</p><p className="mt-1 text-2xl font-semibold text-amber-900">{dueSoonCount}</p></button>
        <button type="button" onClick={() => setFilter("completed")} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left"><p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">Completed</p><p className="mt-1 text-2xl font-semibold text-emerald-900">{completedCount}</p></button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#cfe1d8] bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[["all", "All tasks"], ["overdue", "Overdue"], ["due-soon", "Due soon"], ["completed", "Completed"]].map(([value, text]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === value ? "bg-[#0e5d53] text-white" : "bg-[#e5f3ef] text-[#0e5d53]"}`}>{text}</button>)}
        </div>
        <div className="flex gap-2">
          <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="rounded-full border border-[#cfe1d8] bg-white px-3 py-1.5 text-xs text-slate-700"><option value="all">Everyone</option>{assignees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>
          <button type="button" onClick={() => setView(view === "list" ? "calendar" : "list")} className="rounded-full border border-[#cfe1d8] px-3 py-1.5 text-xs font-medium text-slate-700">{view === "list" ? "Calendar view" : "List view"}</button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {view === "calendar" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks.sort((a, b) => a.due_date.localeCompare(b.due_date)).map((task) => <TaskCard key={task.id} task={task} assigneeName={task.assigned_to ? assigneeNames[task.assigned_to] : "Unassigned"} projectName={projectNames[task.project_id] ?? "Unknown project"} onStatusChange={changeStatus} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => <TaskCard key={task.id} task={task} assigneeName={task.assigned_to ? assigneeNames[task.assigned_to] : "Unassigned"} projectName={projectNames[task.project_id] ?? "Unknown project"} onStatusChange={changeStatus} />)}
          {filteredTasks.length === 0 ? <p className="rounded-2xl border border-dashed border-[#cfe1d8] bg-[#f5faf8] p-8 text-center text-sm text-slate-600">No tasks match these filters.</p> : null}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, assigneeName, projectName, onStatusChange }: { task: Task; assigneeName: string; projectName: string; onStatusChange: (id: string, status: string) => void }) {
  const isOverdue = task.status !== "completed" && task.due_date < today();
  return <article className="rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{task.title}</h3><p className="mt-1 text-xs text-slate-500">{projectName} · Assigned to {assigneeName}</p></div><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)} className="rounded-full border border-[#cfe1d8] bg-white px-2 py-1 text-xs text-slate-700">{TASK_STATUSES.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>{task.description ? <p className="mt-3 text-sm text-slate-600">{task.description}</p> : null}<div className="mt-4 flex items-center justify-between text-xs"><span className={isOverdue ? "font-medium text-rose-700" : "text-slate-500"}>{isOverdue ? "Overdue · " : "Due "}{task.due_date}</span>{task.status === "completed" ? <span className="font-medium text-emerald-700">Completed</span> : null}</div></article>;
}
