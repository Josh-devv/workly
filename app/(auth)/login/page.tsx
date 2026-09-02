"use client";

import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { loginWithEmailPassword } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await loginWithEmailPassword(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
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
              Built for clarity
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.06em] text-slate-900">
              Welcome back.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Keep projects moving, clients organized, and your team aligned in
              one premium workspace.
            </p>
          </div>

          <div className="relative z-10 mt-auto grid gap-3">
            {[
              "Client, project, task, and invoice visibility",
              "Fast updates across your delivery pipeline",
              "A calmer, more professional daily workflow",
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
                Login
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">
                Welcome back
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  className={
                    error ? "border-red-500/60 focus-visible:ring-red-500" : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/login"
                    className="text-sm text-[#0e5d53] hover:text-slate-900"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className={
                      error
                        ? "border-red-500/60 pr-11 focus-visible:ring-red-500"
                        : "pr-11"
                    }
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
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{" "}
              <Link
                href="/register"
                className="font-medium text-[#0e5d53] hover:text-slate-900"
              >
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
