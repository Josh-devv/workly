"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
};

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: Organization[];
  activeOrganizationId?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(activeOrganizationId ?? organizations[0]?.id ?? "");

  useEffect(() => {
    if (activeOrganizationId) {
      setSelected(activeOrganizationId);
    }
  }, [activeOrganizationId]);

  if (!organizations.length) {
    return null;
  }

  async function handleChange(nextOrgId: string) {
    setSelected(nextOrgId);
    document.cookie = `active_org_id=${nextOrgId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    router.refresh();
  }

  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
        Organization
      </span>
      <select
        value={selected}
        onChange={(event) => handleChange(event.target.value)}
        className="w-full rounded-2xl border border-[#cfe1d8] bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0e5d53] focus:ring-2 focus:ring-[#dff4eb]"
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    </label>
  );
}
