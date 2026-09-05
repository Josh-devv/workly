"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/tasks";

type ProjectOption = {
  id: string;
  name: string;
  clientName: string;
};

export default function TaskForm({ projects }: { projects: ProjectOption[] }) {
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createTask({ projectId, title, description });
      setProjectId("");
      setTitle("");
      setDescription("");
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
        <label htmlFor="task-project" className="text-sm font-medium text-slate-700">
          Project
        </label>
        <select
          id="task-project"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
          required
          className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} - {project.clientName}
            </option>
          ))}
        </select>
        {projects.length === 0 ? (
          <p className="text-xs text-amber-700">Add a project before creating a task.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-slate-700">
          Task name
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Prepare homepage copy"
          required
          className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="task-description" className="text-sm font-medium text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What needs to be completed?"
          rows={3}
          className="w-full resize-none rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading || projects.length === 0}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0e5d53] px-5 py-2.75 text-sm font-medium text-white transition hover:bg-[#0a4d47] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating task..." : "Create task"}
      </button>
    </form>
  );
}