"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProject, updateProject } from "@/app/actions/projects";

interface Client {
  id: string;
  name: string;
}


type Project = {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: string;
  rate_type: string;
  rate?: number | null;
  start_date?: string | null;
  deadline?: string | null;
    created_at?: string;
};

interface ProjectListProps {
  project: Project;
  clients: Client[];
}


const ProjectList = ({ project, clients }: ProjectListProps) => {
  const router = useRouter();
  const client = clients.find((c) => c.id === project.client_id);// Find the client object based on the client_id in the project
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [clientId, setClientId] = useState(project.client_id);
  const [status, setStatus] = useState(project.status);
  const [rateType, setRateType] = useState(project.rate_type);
  const [rate, setRate] = useState(project.rate?.toString() ?? "");
  const [startDate, setStartDate] = useState(project.start_date ?? "");
  const [deadline, setDeadline] = useState(project.deadline ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError("");
    try {
      await updateProject(project.id, { client_id: clientId, name, description, status, rateType, rate: rate ? Number(rate) : undefined, startDate: startDate || undefined, deadline: deadline || undefined });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update project.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${project.name}?`)) return;
    setLoading(true);
    try {
      await deleteProject(project.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      {editing ? (
        <div className="grid flex-1 gap-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project name" />
          <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project client">
            {clients.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
          </select>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project description" />
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project status">
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
              <option value="completed">Completed</option>
            </select>
            <select value={rateType} onChange={(event) => setRateType(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project rate type">
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </select>
            <input type="number" min="0" step="0.01" value={rate} onChange={(event) => setRate(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" placeholder="Rate" aria-label="Project rate" />
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project start date" />
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Project deadline" />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      ) : <div>
        <p className="text-lg font-semibold text-slate-900">{project.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {project.description && (
            <p className="text-slate-600">{project.description}</p>
          )}
        </div>
      </div>}

      <div className="flex flex-wrap items-center gap-2 border-t border-[#dfeae4] pt-3 text-xs text-[#0e5d53] sm:border-0 sm:pt-0">
        {editing ? (
          <>
            <button type="button" onClick={save} disabled={loading} className="rounded-lg bg-[#0e5d53] px-3 py-1.5 font-medium text-white">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-[#cfe1d8] bg-white px-3 py-1.5 font-medium text-slate-600">Cancel</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-[#cfe1d8] bg-white px-3 py-1.5 font-medium text-slate-700">Edit</button>
            <button type="button" onClick={remove} disabled={loading} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium text-red-700">Delete</button>
          </>
        )}
        <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 font-medium uppercase tracking-[0.14em]">
          {client ? client.name : "Unknown client"}
        </span>
        {project.created_at ? (
          <span className="text-slate-500">
            {new Date(project.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectList;