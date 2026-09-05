"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTaskStatus } from "@/app/actions/tasks";
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
};

function statusLabel(status: string) {
  return status === "todo" ? "To do" : status === "in-progress" ? "In progress" : "Completed";
}

export default function TaskRow({ task, projectName, clientName, assigneeName }: TaskRowProps) {
  const [status, setStatus] = useState(task.status as TaskStatus);
  const [error, setError] = useState("");
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

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-900">{task.title}</p>
        {task.description ? <p className="mt-1 text-sm text-slate-600">{task.description}</p> : null}
        <p className="mt-2 text-xs text-slate-500">Due {task.due_date}</p>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
        <p className="mt-2 text-xs text-slate-500">Assigned to {assigneeName}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#0e5d53]">
        <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">{projectName}</span>
        <span className="text-slate-500">{clientName}</span>
        <select
          aria-label={`Status for ${task.title}`}
          value={status}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="rounded-full border border-[#cfe1d8] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        >
          {TASK_STATUSES.map((taskStatus) => (
            <option key={taskStatus} value={taskStatus}>{statusLabel(taskStatus)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}