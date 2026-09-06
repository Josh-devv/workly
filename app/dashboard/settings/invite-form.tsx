"use client";

import { useState } from "react";
import { inviteMember } from "@/app/actions/invites";


export default function InviteMemberForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setInviteLink("");

    try {
      const invitation = await inviteMember({ email, role });
      const link = `${window.location.origin}/invite/${invitation.token}`;
      setInviteLink(link);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_0.62fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-800">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@email.com"
              required
              className="w-full rounded-xl border border-[#cfe1d8] bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0e5d53] focus:ring-4 focus:ring-[#0e5d53]/10"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-800">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value === "owner" ? "owner" : "member")}
              className="w-full rounded-xl border border-[#cfe1d8] bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-4 focus:ring-[#0e5d53]/10"
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
          </label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#0e5d53] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0a4d47] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send invitation"}
        </button>
      </form>

      {inviteLink && (
        <div className="rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] p-4">
          <p className="text-sm text-slate-700">Invitation link (copy and share manually for now):</p>
          <p className="mt-2 break-all text-sm font-mono text-[#0e5d53]">{inviteLink}</p>
        </div>
      )}
    </div>
  );
}