"use client";

import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {createOrganization} from "@/app/actions/organizations";


export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [organizationName, setOrganizationName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const label =
      score <= 1 ? "Weak" : score === 2 || score === 3 ? "Good" : "Strong";

    return { checks, score, label };
  }, [password]);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwordChecks.score < 3) {
      setError("Choose a stronger password before creating your account.");
      return;
    }

    setError("");
    setLoading(true);

    // Create a new user with Supabase

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    console.log("User registered:", data.user);

    //a.wait createOrganization(organizationName);
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,93,83,0.14),_transparent_25%),linear-gradient(180deg,#edf4ef_0%,#eaf5f0_100%)] px-4 py-10 text-slate-900">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#dfeae4] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-[#cfe1d8] bg-[linear-gradient(180deg,#e5f3ef_0%,#dfeee8_100%)] p-8 text-slate-900 lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,93,83,0.08),transparent_35%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <img
              src="/workly-mark.svg"
              alt="Workly"
              className="h-10 w-10 rounded-xl"
            />
            <span className="text-xl font-semibold text-slate-900">Workly</span>
          </div>

          <div className="relative z-10 mt-16 max-w-md">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#bfddd2] bg-[#f1faf7] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
              Start fresh
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-slate-900">
              Build a calmer workflow.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Create your workspace and bring your client delivery process into
              one connected view.
            </p>
          </div>

          <div className="relative z-10 mt-auto grid gap-3">
            {[
              "Keep project status clear at a glance",
              "Stay organized across clients and tasks",
              "Deliver a more professional client experience",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-[#cfe1d8] bg-white/60 px-4 py-3 text-sm text-slate-700"
              >
                <ShieldCheck className="h-4 w-4 text-[#0e5d53]" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-3">
                <img
                  src="/workly-mark.svg"
                  alt="Workly"
                  className="h-10 w-10 rounded-xl"
                />
                <span className="text-xl font-semibold text-slate-900">
                  Workly
                </span>
              </div>
            </div>

            <div className="mb-7">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Register
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">
                Create your account
              </h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                  />


                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-[#dfeae4] bg-[#f7faf8] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Password strength</span>
                    <span className="font-medium text-[#0e5d53]">
                      {passwordChecks.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["length", "upper", "number", "symbol"].map((key) => (
                      <div key={key} className="h-2 rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${passwordChecks.checks[key as keyof typeof passwordChecks.checks] ? "bg-[#0e5d53]" : "bg-transparent"}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#0e5d53] hover:text-slate-900"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
