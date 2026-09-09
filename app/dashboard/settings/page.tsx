import { redirect } from "next/navigation";
import { Bell, Building2, Check, Clock3, ShieldCheck, Users } from "lucide-react";

import InviteMemberForm from "./invite-form";
import { getPendingInvitations } from "@/app/actions/invites";
import { createClient } from "@/app/lib/supabase/server";
import { getCurrentMembership, getOrganizationMembers } from "@/app/lib/supabase/organization";

export default async function SettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return (
			<main className="flex min-h-[50vh] items-center justify-center">
				<div className="rounded-[28px] border border-[#cfe1d8] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
					<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
						Session expired
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-slate-900">
						Please sign in again
					</h1>
					<a
						href="/login"
						className="mt-6 inline-flex rounded-full bg-[#0e5d53] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a4d47]"
					>
						Go to login
					</a>
				</div>
			</main>
		);
	}

	const membership = await getCurrentMembership(user.id);

	if (!membership) {
		redirect("/dashboard/setup");
	}

	if (membership.role !== "owner") {
		redirect("/dashboard");
	}

	const organization = membership;
	const [members, pendingInvitations] = await Promise.all([
		getOrganizationMembers(organization.id),
		getPendingInvitations(organization.id),
	]);

	const displayName = user.user_metadata?.name ?? user.email ?? "Your account";

	return (
		<main className="space-y-6">
			<header className="rounded-[28px] border border-[#cfe1d8] bg-gradient-to-br from-white/80 to-[#f1faf7]/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)] sm:p-8">
				<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#0e5d53]">
					Workspace settings
				</p>
				<div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<h1 className="text-3xl font-semibold tracking-[-0.06em] text-slate-900 sm:text-4xl">
							Keep {organization.name} in sync
						</h1>
						<p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
							Manage your workspace details, invite collaborators, and choose how Workly keeps you informed.
						</p>
					</div>
					<div className="flex items-center gap-2 rounded-full border border-[#cfe1d8] bg-[#f1faf7] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-[#0e5d53]">
						<span className="h-2 w-2 rounded-full bg-[#3da88f]" />
						Workspace active
					</div>
				</div>
			</header>

			<div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
				<section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)] sm:p-7">
					<div className="flex items-start gap-4 border-b border-[#e5eee9] pb-6">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5f3ef] text-[#0e5d53]">
							<Users className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-slate-900">Team access</h2>
							<p className="mt-1 text-sm text-slate-600">
								Invite people to collaborate in {organization.name}.
							</p>
						</div>
					</div>

					<div className="pt-6">
						<InviteMemberForm />
					</div>

					<div className="mt-8 border-t border-[#e5eee9] pt-6">
						<div className="flex items-center justify-between gap-3">
							<h2 className="text-lg font-semibold text-slate-900">Workspace members</h2>
							<span className="rounded-full bg-[#e5f3ef] px-2.5 py-1 text-xs font-medium text-[#0e5d53]">{members.length}</span>
						</div>
						<div className="mt-4 space-y-3">
							{members.map((member) => (
								<div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#cfe1d8] bg-[#f7faf8] px-4 py-3">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dff4eb] text-xs font-semibold text-[#0e5d53]">{member.name.slice(0, 2).toUpperCase()}</div>
										<p className="truncate text-sm font-medium text-slate-900">{member.name}</p>
									</div>
									<span className="text-xs font-medium capitalize text-slate-500">{member.role}</span>
								</div>
							))}
							{pendingInvitations.map((invitation) => (
								<div key={invitation.email} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#cfe1d8] bg-white px-4 py-3">
									<div className="flex min-w-0 items-center gap-3">
										<Clock3 className="h-4 w-4 shrink-0 text-[#0e5d53]" />
										<p className="truncate text-sm text-slate-700">{invitation.email}</p>
									</div>
									<span className="text-xs font-medium text-amber-700">Pending</span>
								</div>
							))}
							{members.length === 0 && pendingInvitations.length === 0 ? <p className="text-sm text-slate-500">No members or pending invitations yet.</p> : null}
						</div>
					</div>
				</section>

				<aside className="space-y-6">
					<section className="rounded-[28px] border border-[#cfe1d8] bg-[#e5f3f0] p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0e5d53]">
								<Building2 className="h-5 w-5" />
							</div>
							<div>
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-[#0e5d53]">Workspace</p>
								<h2 className="mt-1 text-lg font-semibold text-slate-900">{organization.name}</h2>
							</div>
						</div>
						<div className="mt-6 space-y-3 text-sm">
							<div className="flex items-center gap-3 text-slate-700">
								<Check className="h-4 w-4 text-[#0e5d53]" />
								<span>Shared client and project data</span>
							</div>
							<div className="flex items-center gap-3 text-slate-700">
								<ShieldCheck className="h-4 w-4 text-[#0e5d53]" />
								<span>Role-based member access</span>
							</div>
						</div>
					</section>

					<section className="rounded-[28px] border border-[#cfe1d8] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.03)]">
						<div className="flex items-center gap-3">
							<Bell className="h-5 w-5 text-[#0e5d53]" />
							<h2 className="text-lg font-semibold text-slate-900">Account</h2>
						</div>
						<p className="mt-4 text-sm text-slate-500">Signed in as</p>
						<p className="mt-1 truncate text-sm font-medium text-slate-900">{displayName}</p>
						<p className="mt-1 truncate text-sm text-slate-600">{user.email}</p>
					</section>
				</aside>
			</div>
		</main>
	);
}
