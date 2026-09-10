"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import Logout from "@/app/components/logout";
import { OrganizationSwitcher } from "@/app/components/organization-switcher";

type NavigationItem = {
  label: string;
  href: string;
};

type Organization = {
  id: string;
  name: string;
};

export function MobileMenu({
  navigation,
  organizations,
  activeOrganizationId,
}: {
  navigation: NavigationItem[];
  organizations: Organization[];
  activeOrganizationId?: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open dashboard navigation"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cfe1d8] bg-white text-[#0e5d53] transition hover:bg-[#f1faf7] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-0 bg-slate-950/25 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 z-10 flex h-full w-[min(88vw,22rem)] min-w-0 flex-col overflow-y-auto overscroll-contain border-r border-[#cfe1d8] bg-[#edf8f3] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/workly-mark.svg" alt="Workly" className="h-9 w-9 rounded-xl" />
                <span className="font-semibold text-slate-900">Workly</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close dashboard navigation"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-7 rounded-2xl border border-[#cfe1d8] bg-white/70 p-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Current workspace
              </p>
              <div className="mt-2">
                <OrganizationSwitcher
                  organizations={organizations}
                  activeOrganizationId={activeOrganizationId}
                />
              </div>
            </div>

            <nav className="mt-6 space-y-1.5" aria-label="Dashboard navigation links">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-[#cfe1d8] bg-white/60 p-4">
              <Logout />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
