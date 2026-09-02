"use client";

import { useState } from "react";
import { createClientAction } from "@/app/actions/client";

export default function ClientForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await createClientAction({
        name,
        company,
        email,
        phone,
      });

      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setSuccess("Client created successfully.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700">
          Client name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jamie Brooks"
          required
          className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-sm font-medium text-slate-700">
          Company
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Northwind Studio"
          className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@company.com"
            className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
          />
        </div>
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0e5d53] px-5 py-2.75 text-sm font-medium text-white transition hover:bg-[#0a4d47] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating client..." : "Add client"}
      </button>
    </form>
  );
}
