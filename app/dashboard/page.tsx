import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Briefcase,
  CheckSquare,
  DollarSign,
  FolderKanban,
  Zap,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/server";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { getCurrentOrganization } from "@/app/lib/supabase/organization";



const summary = [
  { label: "Total clients", value: "0", tone: "default" },
  { label: "Active projects", value: "0", tone: "info" },
  { label: "Pending tasks", value: "0", tone: "warning" },
  { label: "Outstanding invoices", value: "$0.00", tone: "danger" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const organization = await getCurrentOrganization();



  // Get the current user, "whos is logged in"
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log("User data:", user);

  if (!user) {
    redirect("/login");
  }

  
  const {data: organizationData, error: organizationError } = await supabase
    .from("organizations")
    .select("name")
    .eq("created_by", user.id)
    .single();


  const { data: clients, error: clientError } = await supabase
    .from("clients")
    .select("id, name, email, company, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  const clientCount = clients?.length ?? 0;

  summary[0].value = String(clientCount);

  const firstName = user?.user_metadata.name.split(" ")[0] ?? "there";


  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-6 rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/70 to-[#f1faf7]/70 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.04)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
            Overview
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-slate-900 sm:text-5xl">
            Good morning, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
            Here’s a quick view of your client work, delivery health, and what
            still needs attention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="border border-[#cfe1d8] bg-[#f1faf7] text-[#0e5d53] hover:text-slate-900"
          >
            View reports
          </Button>
          <Button asChild>
            <Link href="/dashboard/clients">Add client</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item, index) => {
          const icons = [Briefcase, FolderKanban, CheckSquare, DollarSign];
          const Icon = icons[index];

          return (
            <div
              key={item.label}
              className="rounded-[24px] border border-[#cfe1d8] bg-gradient-to-br from-white/70 to-[#f1faf7]/65 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.03)]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-[#0e5d53]">{item.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e5f3ef] text-[#0e5d53]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                {item.value}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#0e5d53]">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#0e5d53]" />
                Updated today
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/70 to-[#f1faf7]/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.03)] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Recent clients
          </h2>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#0e5d53]"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {
          organizationError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              We couldn’t load your organization data right now.
            </div>
          ) : (
            <div className="rounded-2xl border border-[#cfe1d8] bg-[#e5f3f0] p-4">
              <p>Organization: {organizationData?.name ?? "No organization found"}</p>
            </div>
          )
        }

        {clientError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            We couldn’t load recent client activity right now.
          </div>
        ) : clientCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cfe1d8] bg-[#e5f3f0] p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f3ef] text-[#0e5d53]">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No clients yet
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Add your first client to start building your pipeline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients?.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#cfe1d8] bg-[#e5f3f0] px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {client.name}
                  </p>
                  <p className="truncate text-sm text-[#0e5d53]">
                    {client.company || "Independent"}
                  </p>
                </div>
                <div className="text-right text-sm text-[#0e5d53]">
                  <p>{client.email || "No email"}</p>
                  <p className="mt-1">
                    {new Date(
                      client.created_at ?? Date.now(),
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}


        <div className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/70 to-[#f1faf7]/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.03)] sm:p-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Quick actions
          </h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Create project", tone: "default" },
              { label: "Add task", tone: "info" },
              { label: "Send invoice", tone: "warning" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center justify-between rounded-2xl border border-[#cfe1d8] bg-[#e5f3f0] px-4 py-3 text-left transition-colors hover:border-[#bfddd2]"
              >
                <span className="font-medium text-slate-900">{item.label}</span>
                <Badge variant={item.tone as "default" | "info" | "warning"}>
                  {item.tone === "default"
                    ? "New"
                    : item.tone === "info"
                      ? "Now"
                      : "Draft"}
                </Badge>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#bfddd2] bg-[#f1faf7] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#0e5d53]">
              <Zap className="h-4 w-4" />
              Momentum
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Your team is tracking steadily. Two tasks are due this week.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
