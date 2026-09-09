"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClientAction, updateClientAction } from "@/app/actions/client";

type Props = {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  created_at?: string;
  phone?: string | null;
};

const ClientList = ({ client }: { client: Props }) => {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(client.name);
  const [company, setCompany] = useState(client.company ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [phone, setPhone] = useState(client.phone ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError("");
    try {
      await updateClientAction(client.id, { name, company, email, phone });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update client.");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ${client.name}?`)) return;
    setLoading(true);
    try {
      await deleteClientAction(client.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete client.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-[#cfe1d8] bg-[#f7faf8] p-4 sm:flex-row sm:items-center sm:justify-between">
      {editing ? (
        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" aria-label="Client name" />
          <input value={company} onChange={(event) => setCompany(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" placeholder="Company" aria-label="Company" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" placeholder="Email" aria-label="Email" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-xl border border-[#cfe1d8] bg-white px-3 py-2 text-sm" placeholder="Phone" aria-label="Phone" />
          {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
        </div>
      ) : <div>
        <p className="text-lg font-semibold text-slate-900">{client.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {client.company ? <span>{client.company}</span> : <span>Independent client</span>}
          {client.email ? (
            <>
              <span className="text-slate-300">•</span>
              <span>{client.email}</span>
            </>
          ) : null}
        </div>
      </div>}

      <div className="flex items-center gap-2 text-xs text-[#0e5d53]">
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
          Client
        </span>
        {client.created_at ? (
          <span className="text-slate-500">
            {new Date(client.created_at).toLocaleDateString(undefined, {
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

export default ClientList;