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