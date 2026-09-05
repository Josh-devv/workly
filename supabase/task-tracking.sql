-- Task tracking additions. Run after public.tasks and public.users exist.

alter table public.tasks
  add column if not exists assigned_to uuid references public.users(id) on delete set null,
  add column if not exists completed_at timestamptz;

create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- Keep completion metadata consistent with the workflow status.
create or replace function public.set_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and (old.status is distinct from 'completed' or new.completed_at is null) then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status <> 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_completion_timestamp on public.tasks;
create trigger tasks_completion_timestamp
before insert or update of status, completed_at on public.tasks
for each row execute function public.set_task_completed_at();

-- Allow organization members to be selected as assignees.
create policy "Members can view organization users"
on public.users
for select to authenticated
using (exists (
  select 1
  from public.organization_members om
  where om.user_id = users.id
    and om.organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
    )
));
