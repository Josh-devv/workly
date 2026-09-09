import Link from "next/link";
import { Building2, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

import AcceptInviteForm from "./accept-invite-form";
import { getInvitation } from "@/app/actions/invites";
import { createClient } from "@/app/lib/supabase/server";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let invitation = null;
  let lookupError = "";

  try {
    invitation = await getInvitation(token);
  } catch {
    lookupError = "This invitation is unavailable or has expired.";
  }

  const expired = invitation ? new Date(invitation.expires_at) <= new Date() : false;// Check if the invitation has expired by comparing the expiration date with the current date
  const loginHref = `/login?invite=${encodeURIComponent(token)}`;
  const registerHref = `/register?invite=${encodeURIComponent(token)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,93,83,0.14),_transparent_25%),linear-gradient(180deg,#edf4ef_0%,#eaf5f0_100%)] px-4 py-10 text-slate-900">
      <section className="w-full max-w-xl rounded-[32px] border border-[#cfe1d8] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <div className="flex items-center gap-3">
          <img src="/workly-mark.svg" alt="Workly" className="h-10 w-10 rounded-xl" />
          <span className="text-xl font-semibold">Workly</span>
        </div>

        {lookupError || !invitation || expired ? (
          <div className="mt-12 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-600">Invitation unavailable</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">This link can no longer be used</h1>
            <p className="mt-4 text-sm text-slate-600">
              The invitation may be invalid, expired, or already accepted.
            </p>
            <Link href="/login" className="mt-7 inline-flex rounded-xl bg-[#0e5d53] px-5 py-3 text-sm font-medium text-white">
              Go to login
            </Link>
          </div>
        ) : (
          <div className="mt-12">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">You are invited</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">Join {invitation.organization_name}</h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Collaborate with this workspace in Workly. This invitation expires in seven days.
            </p>

            <div className="mt-7 space-y-3 rounded-2xl border border-[#dfeae4] bg-[#f7faf8] p-4 text-sm">
              <div className="flex items-center gap-3 text-slate-700"><Building2 className="h-4 w-4 text-[#0e5d53]" /> {invitation.organization_name}</div>
              <div className="flex items-center gap-3 text-slate-700"><Mail className="h-4 w-4 text-[#0e5d53]" /> {invitation.email}</div>
              <div className="flex items-center gap-3 text-slate-700"><ShieldCheck className="h-4 w-4 text-[#0e5d53]" /> {invitation.role} access</div>
            </div>

            <div className="mt-7">
              {user ? (
                <AcceptInviteForm token={token} />
              ) : (
                <div className="space-y-3">
                  <Link href={loginHref} className="flex w-full items-center justify-center rounded-xl bg-[#0e5d53] px-4 py-3 text-sm font-medium text-white">Sign in to accept</Link>
                  <Link href={registerHref} className="flex w-full items-center justify-center rounded-xl border border-[#cfe1d8] bg-white px-4 py-3 text-sm font-medium text-slate-700">Create an account</Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-[#0e5d53]" /> Secure workspace invitation
        </div>
      </section>
    </main>
  );
}