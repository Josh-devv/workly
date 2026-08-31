import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,

  FolderKanban,
  LayoutGrid,
  MessageSquareText,
  ShieldCheck,

  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const features = [
  {
    icon: LayoutGrid,
    title: "Client pipeline",
    description: "Track leads, active clients, and project status in one clean workspace.",
  },
  {
    icon: FolderKanban,
    title: "Project delivery",
    description: "Manage scope, milestones, deadlines, and team handoffs without the chaos.",
  },
  {
    icon: ShieldCheck,
    title: "Quality control",
    description: "Keep service delivery consistent with approvals, checklists, and status visibility.",
  },
  {
    icon: Users,
    title: "Team coordination",
    description: "Keep stakeholders aligned with clear ownership, updates, and responsibilities.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Client operations",
    description: "Turn invoices, proposals, and client communication into one connected workflow.",
  },
  {
    icon: MessageSquareText,
    title: "Smarter reporting",
    description: "See performance, workload, and progress in real time with less admin overhead.",
  },
];

const stats = [
  { value: "2.4x", label: "faster coordination" },
  { value: "88%", label: "less admin work" },
  { value: "24/7", label: "visibility" },
];

const pageBackground = "bg-[radial-gradient(circle_at_top,_rgba(26,107,93,0.13),_transparent_22%),linear-gradient(180deg,#edf6f0_0%,#eef4ef_36%,#f7f5f2_100%)]";

const benefits = [
  {
    title: "Stay on top of every client",
    description: "Keep client details, notes, and project health in one place so nothing slips through the cracks.",
  },
  {
    title: "Run projects without the chaos",
    description: "Turn scattered updates into a clear workflow with deadlines, dependencies, and delivery visibility.",
  },
  {
    title: "Move from work to invoice faster",
    description: "Tie tasks, project progress, and billing together so your team can close faster and more confidently.",
  },
];

const logoNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function LandingPage() {
  return (
    <main className={`min-h-screen text-slate-900 ${pageBackground}`}>
      <div className="mx-auto max-w-[1600px] px-3 py-3 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-[#dfeae4] bg-white/30 p-4 shadow-[0_25px_60px_rgba(15,23,42,0.04)] backdrop-blur-[2px] md:p-6">
          <header className="flex items-center justify-between gap-4 px-2 py-3">
            <Link href="/" className="flex items-center gap-3">
              <img src="/workly-mark.svg" alt="Workly" className="h-11 w-11 rounded-full" />
              <span className="text-lg font-semibold tracking-[-0.04em] text-slate-900">Workly</span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
              <Link href="#features" className="transition-colors hover:text-slate-900">Features</Link>
              <Link href="#workflow" className="transition-colors hover:text-slate-900">Workflow</Link>
              <Link href="#pricing" className="transition-colors hover:text-slate-900">Pricing</Link>
            </nav>

            <div className="flex items-center gap-2">
              <button className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          </header>

          <section className="relative px-2 pb-10 pt-10 sm:px-4 lg:px-8 lg:pb-16 lg:pt-16">
            <div className="pointer-events-none absolute inset-x-8 top-0 hidden h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent lg:block" />

            

            <div className="absolute right-10 top-32 hidden h-16 w-16 items-center justify-center rounded-full border border-[#dfe8e4] bg-white text-xl text-slate-700 shadow-sm lg:flex">
              <Zap className="h-6 w-6" />
            </div>

            <div className="absolute left-12 top-[18rem] hidden h-12 w-12 items-center justify-center rounded-full border border-[#dfe8e4] bg-[#eaf4ea] text-lg text-slate-700 shadow-sm lg:flex">
              <ArrowRight className="h-4 w-4" />
            </div>

            <div className="absolute right-14 top-[18rem] hidden h-12 w-12 items-center justify-center rounded-full border border-[#dfe8e4] bg-[#eaf4ea] text-lg text-slate-700 shadow-sm lg:flex">
              <BarChart3 className="h-4 w-4" />
            </div>

            <div className="mx-auto max-w-5xl text-center">
              <h1 className="text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.07em] text-slate-900 sm:text-[4.2rem] lg:text-[7rem]">
                Run client work
                <span className="mt-2 block text-[#1d5d5b]">without the chaos</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                Workly gives service businesses one calm, premium system for clients, projects, delivery, and invoicing.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <Button size="lg" className="px-20" asChild>
                  <Link href="/register">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
              </div>

              <div className="mt-9 flex items-center justify-center gap-4 text-slate-700">
                <div className="flex items-center gap-1 text-[#d4a829]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-2xl font-semibold tracking-[-0.05em]">5.0</span>
                <span className="text-sm text-slate-500">from 80+ reviews</span>
              </div>
            </div>

            <div className="mt-12 space-y-0">
              <svg className="w-full h-8 text-[#dfeee7]" viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ display: 'block' }}>
                <path d="M0,30 Q150,0 300,30 T600,30 Q750,0 900,30 T1200,30 L1200,40 L0,40 Z" fill="currentColor" />
              </svg>
              <div className="grid gap-8 md:grid-cols-3 w-full px-4 items-end">
                <div className="-translate-y-12 rounded-[28px] border border-[#d8e9df] bg-[#dfeee7] shadow-[0_20px_50px_rgba(22,64,62,0.15)] p-12">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-semibold leading-none tracking-[-0.08em] text-[#0d2c2a]">100+</div>
                      <p className="mt-8 text-2xl leading-relaxed text-[#1d3c3a]">
                        Client relationships managed with clarity
                      </p>
                    </div>
                  </div>
                </div>

                <div className="translate-y-6 rounded-[28px] border border-slate-200 bg-[#f5f3ef] shadow-[0_16px_40px_rgba(15,23,42,0.04)] p-12">
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#deecdf] text-[#1d5d5b]">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                    <button className="text-slate-500 text-2xl">•••</button>
                  </div>
                  <div className="mt-10 text-sm uppercase tracking-[0.18em] text-slate-500">Active projects</div>
                  <div className="mt-6 flex items-end gap-3">
                    <span className="text-4xl font-semibold tracking-[-0.07em] text-slate-900">1951+</span>
                    <span className="mb-2 text-sm font-medium text-emerald-600">▲ 8%</span>
                  </div>
                  <p className="mt-6 text-lg text-slate-500">Across client delivery and operations</p>
                </div>

                <div className="-translate-y-12 rounded-[28px] border border-[#dcead4] bg-[#dfead1] shadow-[0_18px_40px_rgba(116,144,128,0.15)] p-12">
                  <div className="mb-8 text-4xl font-semibold leading-none tracking-[-0.08em] text-slate-900">24/7</div>
                  <p className="text-2xl leading-relaxed text-slate-700">
                    Visibility across work, team, and priorities
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section id="features" className="bg-[#dfeee8] px-4 py-20 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-[2.3rem] font-semibold leading-[1] tracking-[-0.07em] text-[#102b2a] sm:text-[4rem]">
            Everything your service business needs
            <span className="mt-2 block text-[#173a38]">to move faster and stay aligned</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#244643]">
            Workly brings client work, project delivery, team visibility, and invoicing into one premium operating system.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group rounded-[26px] border border-[#d0e5da] bg-[#edf7f1] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-transform duration-200 hover:-translate-y-1 hover:bg-[#f2faf5]">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#bddac7] bg-white/60 text-[#0d2c2a]">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-5 w-5 text-[#173a38] transition-transform group-hover:translate-x-1" />
              </div>

              <h3 className="mt-10 text-3xl font-semibold tracking-[-0.05em] text-[#102b2a]">{title}</h3>
              <p className="mt-4 max-w-xs text-base leading-7 text-[#1f3c3a]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f1f0ed] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-slate-200 bg-[#dfece2] p-6 shadow-[0_18px_30px_rgba(15,23,42,0.03)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium uppercase tracking-[0.16em] text-slate-600">Client health</div>
              <div className="text-lg font-semibold text-slate-700">+16.8%</div>
            </div>

            <div className="mt-8 space-y-5 text-slate-700">
              {[
                { label: "On track", value: 75 },
                { label: "At risk", value: 15 },
                { label: "Delayed", value: 10 },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="text-base text-slate-700">{row.label}</span>
                  <div className="flex w-36 items-center gap-3">
                    <div className="h-2.5 flex-1 rounded-full bg-slate-200/80">
                      <div className="h-full rounded-full bg-slate-500/70" style={{ width: `${row.value}%` }} />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">{row.value}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[26px] border border-slate-200 bg-[#f3f1ee] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dfece2] text-[#1d5d5b]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <button className="text-slate-500">•••</button>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.16em] text-slate-500">Open projects</div>
                  <div className="mt-3 text-5xl font-semibold tracking-[-0.07em] text-slate-900">483</div>
                </div>
                <div className="rounded-full bg-[#dfece2] px-2 py-1 text-xs font-medium text-[#1d5d5b]">▲ 8%</div>
              </div>

              <div className="mt-6 flex h-20 items-end gap-3">
                {[24, 35, 52, 67, 80].map((height, index) => (
                  <div key={height + index} className="flex-1 rounded-t-xl bg-gradient-to-t from-[#4a736f] via-[#7bb39d] to-[#cfe8c0]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="max-w-xl text-[2.5rem] font-semibold leading-[1] tracking-[-0.07em] text-slate-900 sm:text-[4rem]">
              Keep your operations clear, calm, and profitable
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              Workly helps your team stay in sync, deliver better work, and turn client momentum into measurable business growth.
            </p>

            <div className="mt-10 space-y-8">
              {benefits.map(({ title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#dfece2] text-[#1d5d5b]">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">{title}</h3>
                    <p className="mt-2 max-w-[640px] text-base leading-7 text-slate-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#f1f0ed] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-slate-200 bg-[#f8f7f4] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.03)]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[2.5rem] font-semibold leading-[1] tracking-[-0.07em] text-slate-900 sm:text-[4rem]">
              Tailored plans for your client operations
            </h2>
            <p className="mt-4 text-base text-slate-600">Simple pricing for service teams at every stage of growth.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-slate-200 bg-[#f3f3f1] p-7">
              <h3 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Starter</h3>
              <p className="mt-3 max-w-md text-base leading-7 text-slate-600">Built for founders and small teams that need a cleaner way to manage clients and delivery.</p>

              <div className="mt-8 text-5xl font-semibold tracking-[-0.07em] text-slate-900">
                $39 <span className="text-xl text-slate-500">/ month</span>
              </div>

              <button className="mt-8 flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50">
                Get started
              </button>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Includes</div>
                <ul className="space-y-4 text-base text-slate-700">
                  {[
                    "Client and project tracking",
                    "Shared team dashboard",
                    "Task management and deadlines",
                    "Billing and invoice visibility",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#dfece2] text-[#1d5d5b]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-[#f3f3f1] p-7">
              <h3 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Scale</h3>
              <p className="mt-3 max-w-md text-base leading-7 text-slate-600">Perfect for growing teams that need deeper automation, reporting, and operational clarity.</p>

              <div className="mt-8 text-5xl font-semibold tracking-[-0.07em] text-slate-900">
                $99 <span className="text-xl text-slate-500">/ month</span>
              </div>

              <button className="mt-8 flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-50">
                Get started
              </button>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="mb-5 text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Includes</div>
                <ul className="space-y-4 text-base text-slate-700">
                  {[
                    "Unlimited clients and projects",
                    "Advanced reporting and forecasting",
                    "Workflow automation and approvals",
                    "Priority support and onboarding",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#dfece2] text-[#1d5d5b]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-[30px] border border-[#cfe1d8] bg-[#dfeee8] px-6 py-10 text-center text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <h3 className="text-[2.2rem] font-semibold tracking-[-0.05em] text-[#102b2a]">Professional</h3>
            <p className="mx-auto mt-3 max-w-xl text-base text-[#244643]">
              Built for growing agencies and service teams that need structure, speed, and consistent client experience.
            </p>
            <Button size="lg" asChild className="mt-7 px-8 bg-[#d7f1b7] text-slate-900 hover:brightness-105">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f0ed] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-6 rounded-[32px] border border-slate-200 bg-[#f4f4f2] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.03)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="max-w-xl text-[2.5rem] font-semibold leading-[1] tracking-[-0.07em] text-slate-900 sm:text-[4rem]">
              Integrations that keep your tools working together
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Connect the tools you already use and keep clients, projects, tasks, and internal updates in sync without extra admin work.
            </p>

            <button className="mt-8 inline-flex items-center rounded-full bg-[#dfece2] px-6 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-[#d4e4d7]">
              Work with us
            </button>
          </div>

          <div className="relative overflow-hidden rounded-[28px] bg-[#d7e9c8] p-6">
            <div className="relative mx-auto flex h-[380px] max-w-[480px] items-center justify-center">
              {[0, 1, 2, 3].map((ring) => (
                <div key={ring} className="absolute rounded-full border border-[#7aa77e]/40" style={{ width: `${220 + ring * 60}px`, height: `${220 + ring * 60}px` }} />
              ))}

              <div className="grid w-full max-w-[320px] grid-cols-3 gap-4">
                {logoNames.map((logo, index) => (
                  <div key={logo} className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d1d9d0] bg-white text-xl font-semibold ${index % 2 === 0 ? "text-[#1d5d5b]" : "text-[#264d92]"}`}>
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#dfeee8] px-4 pb-10 pt-16 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-[#cfe1d8] bg-[#edf7f1] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:p-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_0.7fr_0.7fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/workly-mark.svg" alt="Workly" className="h-10 w-10 rounded-full" />
                <span className="text-2xl font-semibold tracking-[-0.05em] text-[#102b2a]">Workly</span>
              </div>
              <p className="mt-4 max-w-xs text-base leading-7 text-[#244643]">
                The premium operating system for modern client work, project delivery, and team clarity.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-[#102b2a]">Platform</h4>
              <ul className="mt-5 space-y-3 text-[#244643]">
                <li>Clients</li>
                <li>Projects</li>
                <li>Tasks</li>
                <li>Invoices</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-[#102b2a]">Company</h4>
              <ul className="mt-5 space-y-3 text-[#244643]">
                <li>About us</li>
                <li>Customers</li>
                <li>Resources</li>
                <li>Contact</li>
              </ul>
            </div>

            <div className="lg:text-right">
              <h4 className="text-xl font-semibold text-[#102b2a]">Get in touch</h4>
              <a href="mailto:hello@workly.co" className="mt-5 inline-block text-[#1f3c3a] underline decoration-[#3f6a64] underline-offset-4">
                hello@workly.co
              </a>
              <div className="mt-5 flex justify-start gap-3 lg:justify-end">
                {['in', 'x', 'o'].map((item) => (
                  <div key={item} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#cfe1d8] bg-white/60 text-sm font-semibold text-[#102b2a]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#cfe1d8] pt-5 text-sm text-[#244643] sm:flex sm:items-center sm:justify-between">
            <span>© 2024 Workly. All rights reserved</span>
            <div className="mt-2 flex gap-5 sm:mt-0">
              <span>Terms & Conditions</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
