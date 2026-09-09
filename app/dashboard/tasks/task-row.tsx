"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTask, updateTaskStatus } from "@/app/actions/tasks";
import { TASK_STATUSES, type TaskStatus } from "@/app/lib/task-status";

type TaskRowProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string;
    project_id: string;
    assigned_to: string | null;
  };
  projectName: string;
  clientName: string;
  assigneeName: string;
  members: { id: string; name: string }[];
  canEdit: boolean;
};

function statusLabel(status: string) {
  return status === "todo" ? "To do" : status === "in-progress" ? "In progress" : "Completed";
}

export default function TaskRow({ task, projectName, clientName, assigneeName, members, canEdit }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(task.status as TaskStatus);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.due_date);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStatusChange(nextStatus: string) {
    setError("");
    const previousStatus = status;
    setStatus(nextStatus as TaskStatus);

    try {
      await updateTaskStatus(task.id, nextStatus);
      router.refresh();
    } catch (err) {
      setStatus(previousStatus);
      setError(err instanceof Error ? err.message : "Unable to update task.");
    }
  }

  async function save() {
    setLoading(true);
    setError("");
    try {
      await updateTask(task.id, { title, description, status, dueDate, assignedTo });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update task.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${task.title}?`)) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete task.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      {editing ? (
        <div className="grid flex-1 gap-2">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Task title" />
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Task description" />
          <div className="grid gap-2 sm:grid-cols-3">
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Task status">
              {TASK_STATUSES.map((taskStatus) => <option key={taskStatus} value={taskStatus}>{statusLabel(taskStatus)}</option>)}
            </select>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Task due date" />
            <select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Task assignee">
              {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </div>
        </div>
      ) : <div>
        <p className="text-lg font-semibold text-slate-900">{task.title}</p>
        {task.description ? <p className="mt-1 text-sm text-slate-600">{task.description}</p> : null}
        <p className="mt-2 text-xs text-slate-500">Due {task.due_date}</p>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-500">Assigned to {assigneeName}</p>
      </div>}
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#0e5d53]">
        <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">{projectName}</span>
        <span className="text-slate-500">{clientName}</span>
        {!editing ? <select
          aria-label={`Status for ${task.title}`}
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="rounded-full border border-[#cfe1d8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        >
          {TASK_STATUSES.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>{statusLabel(taskStatus)}</option>
          ))}
        </select> : null}
        {canEdit && editing ? <>
          <button type="button" onClick={save} disabled={loading} className="rounded-lg bg-[#0e5d53] px-3 py-1.5 font-medium text-white">Save</button>
          <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-[#cfe1d8] bg-white px-3 py-1.5 font-medium text-slate-600">Cancel</button>
        </> : canEdit ? <>
          <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-[#cfe1d8] bg-white px-3 py-1.5 font-medium text-slate-700">Edit</button>
          <button type="button" onClick={remove} disabled={loading} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium text-red-700">Delete</button>
        </> : null}
      </div>
    </div>
  );
}