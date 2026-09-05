"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/actions/projects";

export default function NewProjectForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("planning");
  const [rateType, setRateType] = useState("fixed");
  const [rate, setRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 const [success, setSuccess] = useState("");

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createProject({
        client_id: clientId,
        name,
        description,
        status,
        rateType,
        rate: rate ? Number(rate) : undefined,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
      });
      router.push("/dashboard/projects");
            setName("");
      setClientId("");
      setDescription("");
      setStatus("planning");
      setRateType("fixed");
      setRate("");
      setStartDate("");
      setDeadline("");
      setSuccess("Project created successfully.");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="project-client" className="text-sm font-medium text-slate-700">Client</label>
        <select id="project-client" value={clientId} onChange={(e) => setClientId(e.target.value)} required className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]">
          <option value="">Select a client</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        {clients.length === 0 ? <p className="text-xs text-amber-700">Add a client before creating a project.</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="project-name" className="text-sm font-medium text-slate-700">Project name</label>
        <input id="project-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Website redesign" required className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]" />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-description" className="text-sm font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></label>
        <textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you delivering?" rows={3} className="w-full resize-none rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="project-status" className="text-sm font-medium text-slate-700">Status</label><select id="project-status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"><option value="planning">Planning</option><option value="active">Active</option><option value="on-hold">On hold</option><option value="completed">Completed</option></select></div>
        <div className="space-y-2"><label htmlFor="project-rate-type" className="text-sm font-medium text-slate-700">Rate type</label><select id="project-rate-type" value={rateType} onChange={(e) => setRateType(e.target.value)} className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"><option value="fixed">Fixed price</option><option value="hourly">Hourly</option></select></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><label htmlFor="project-rate" className="text-sm font-medium text-slate-700">Rate <span className="font-normal text-slate-400">(optional)</span></label><input id="project-rate" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.00" className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]" /></div>
        <div className="space-y-2"><label htmlFor="project-start" className="text-sm font-medium text-slate-700">Start date <span className="font-normal text-slate-400">(optional)</span></label><input id="project-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]" /></div>
      </div>

      <div className="space-y-2"><label htmlFor="project-deadline" className="text-sm font-medium text-slate-700">Deadline <span className="font-normal text-slate-400">(optional)</span></label><input id="project-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]" /></div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <button type="submit" disabled={loading || clients.length === 0} className="inline-flex w-full items-center justify-center rounded-full bg-[#0e5d53] px-5 py-2.75 text-sm font-medium text-white transition hover:bg-[#0a4d47] disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? "Creating project..." : "Create project"}
      </button>
    </form>
  );
}