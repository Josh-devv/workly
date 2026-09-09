-- Invitation lifecycle support. Run this in the Supabase SQL editor.

alter table public.organization_invitations
  add column if not exists accepted_at timestamptz,
  add column if not exists accepted_by uuid references auth.users(id);

create unique index if not exists organization_invitations_token_idx
  on public.organization_invitations (token);

create unique index if not exists organization_members_organization_user_idx
  on public.organization_members (organization_id, user_id);

create or replace function public.get_organization_invitation(invitation_token text)
returns table (organization_name text, email text, role text, expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select o.name, i.email, i.role, i.expires_at
  from public.organization_invitations i
  join public.organizations o on o.id = i.organization_id
  where i.token = invitation_token
    and i.accepted_at is null;
$$;

create or replace function public.accept_organization_invitation(invitation_token text)
returns table (organization_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.organization_invitations%rowtype;
  current_email text;
  workspace_name text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to accept this invitation.';
  end if;

  select lower(email) into current_email from auth.users where id = auth.uid();

  select * into invitation
  from public.organization_invitations
  where token = invitation_token
  for update;

  if not found or invitation.accepted_at is not null then
    raise exception 'This invitation is invalid or has already been accepted.';
  end if;

  if invitation.expires_at <= now() then
    raise exception 'This invitation has expired.';
  end if;

  if lower(invitation.email) <> current_email then
    raise exception 'Sign in with the email address that received this invitation.';
  end if;

  insert into public.users (id, name)
  values (
    auth.uid(),
    coalesce((select raw_user_meta_data->>'name' from auth.users where id = auth.uid()), current_email)
  )
  on conflict (id) do update set name = excluded.name;

  insert into public.organization_members (organization_id, user_id, role)
  values (invitation.organization_id, auth.uid(), invitation.role)
  on conflict (organization_id, user_id) do nothing;

  update public.organization_invitations
  set accepted_at = now(), accepted_by = auth.uid()
  where token = invitation_token and accepted_at is null;

  select name into workspace_name from public.organizations where id = invitation.organization_id;
  return query select workspace_name;
end;
$$;

grant execute on function public.get_organization_invitation(text) to anon, authenticated;
grant execute on function public.accept_organization_invitation(text) to authenticated;

create or replace function public.get_pending_organization_invitations(target_organization_id uuid)
returns table (email text, role text, expires_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select i.email, i.role, i.expires_at
  from public.organization_invitations i
  where i.organization_id = target_organization_id
    and i.accepted_at is null
    and i.expires_at > now()
    and exists (
      select 1
      from public.organization_members om
      where om.organization_id = i.organization_id
        and om.user_id = auth.uid()
        and om.role = 'owner'
    );
$$;

grant execute on function public.get_pending_organization_invitations(uuid) to authenticated;

-- Let members read workspace membership and organization records.
alter table public.organization_members enable row level security;
alter table public.organizations enable row level security;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = auth.uid()
  );
$$;

grant execute on function public.is_organization_member(uuid) to authenticated;

drop policy if exists "Members can view their own memberships" on public.organization_members;
drop policy if exists "Members can view workspace memberships" on public.organization_members;
create policy "Members can view workspace memberships"
on public.organization_members
for select to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "Members can view their organizations" on public.organizations;
create policy "Members can view their organizations"
on public.organizations
for select to authenticated
using (public.is_organization_member(id));

create or replace function public.is_user_in_my_organization(target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members target_membership
    join public.organization_members my_membership
      on my_membership.organization_id = target_membership.organization_id
    where target_membership.user_id = target_user_id
      and my_membership.user_id = auth.uid()
  );
$$;

grant execute on function public.is_user_in_my_organization(uuid) to authenticated;

alter table public.users enable row level security;
drop policy if exists "Members can view organization users" on public.users;
create policy "Members can view organization users"
on public.users
for select to authenticated
using (public.is_user_in_my_organization(id));

-- Backfill profiles for users who accepted before profile creation was added.
insert into public.users (id, name)
select id, coalesce(raw_user_meta_data->>'name', email)
from auth.users
on conflict (id) do update set name = excluded.name;

-- Repair invitations accepted before accepted_at was updated correctly.
update public.organization_invitations invitation
set accepted_at = coalesce(invitation.accepted_at, now()),
    accepted_by = coalesce(invitation.accepted_by, account.id)
from auth.users account
join public.organization_members membership
  on membership.user_id = account.id
where invitation.accepted_at is null
  and lower(invitation.email) = lower(account.email)
  and membership.organization_id = invitation.organization_id;