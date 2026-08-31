import Link from "next/link";
import { ReactNode } from "react";
import Logout from "@/app/components/logout";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients", href: "/dashboard/clients" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Time Tracking", href: "/dashboard/time-tracking" },
  { label: "Invoices", href: "/dashboard/invoices" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,93,83,0.12),_transparent_26%),linear-gradient(180deg,#edf4ef_0%,#edf8f3_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-[#cfe1d8] bg-[linear-gradient(180deg,#edf8f3_0%,#e3f0eb_100%)] p-6 text-slate-900 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <img src="/workly-mark.svg" alt="Workly" className="h-9 w-9 rounded-xl" />
            <div className="text-lg font-semibold text-slate-900">Workly</div>
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-[#cfe1d8] hover:bg-white/60 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-[#cfe1d8] bg-white/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff4eb] text-sm font-semibold text-[#0e5d53]">
                SO
              </div>
              <div className="min-w-0">
               
                <Logout />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-[#dfeae4] bg-white/70 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 lg:hidden">
                <img src="/workly-mark.svg" alt="Workly" className="h-8 w-8 rounded-lg" />
                <span className="font-semibold text-slate-900">Workly</span>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button className="rounded-xl border border-[#dfeae4] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#b8d7cd] hover:text-slate-900">
                  New project
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff4eb] text-sm font-semibold text-[#0e5d53]">
                  SO
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
