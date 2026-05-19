-- Block / soft-delete users; allow admins to update profiles

alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

alter table public.profiles
  add column if not exists deleted_at timestamptz;

drop policy if exists "Admins can update profiles" on public.profiles;

create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.protect_profile_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.is_blocked := old.is_blocked;
  new.deleted_at := old.deleted_at;
  return new;
end;
$$;

drop trigger if exists protect_profile_moderation on public.profiles;

create trigger protect_profile_moderation
  before update on public.profiles
  for each row
  execute function public.protect_profile_moderation_fields();
