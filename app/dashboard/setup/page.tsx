"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/actions/organizations";
import { createClient } from "@/app/lib/supabase/client";

export default function OrganizationSetup() {
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string }>>([]);
  const [fetching, setFetching] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function loadOrganizations() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setFetching(false);
        return;
      }

      const { data, error: membershipsError } = await supabase
        .from("organization_members")
        .select("organization_id, organizations(id, name)")
        .eq("user_id", user.id);

      if (!membershipsError && data) {
        const mappedOrganizations = data
          .flatMap((row: any) => {
            const orgs = Array.isArray(row.organizations)
              ? row.organizations
              : row.organizations
                ? [row.organizations]
                : [];

            return orgs.map((org: any) => ({ id: org.id, name: org.name }));
          });

        setOrganizations(mappedOrganizations);
      }

      setFetching(false);
    }

    loadOrganizations();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createOrganization(organizationName);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/80 to-[#f1faf7]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
          Workspace setup
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900 sm:text-4xl">
          Create or manage your organizations
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Keep each client list, project board, and team inside the correct organization.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <h2 className="text-xl font-semibold text-slate-900">Create a new organization</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="org-name" className="text-sm font-medium text-slate-700">
                Organization name
              </label>
              <input
                id="org-name"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Studio"
                required
                className="w-full rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-[#0e5d53] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0a4d47] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create organization"}
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Your organizations</h2>
            <span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#0e5d53]">
              {organizations.length}
            </span>
          </div>

          {fetching ? (
            <div className="mt-6 text-sm text-slate-500">Loading organizations...</div>
          ) : organizations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[#cfe1d8] bg-[#f3faf7] p-6 text-sm text-slate-600">
              You have not created any organizations yet.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{org.name}</p>
                    <p className="text-xs text-slate-500">Workspace</p>
                  </div>
                  <span className="rounded-full border border-[#cfe1d8] bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#0e5d53]">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}