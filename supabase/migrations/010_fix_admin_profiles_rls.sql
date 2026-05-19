-- Fix admin RLS recursion on profiles (subquery on same table blocks all rows)

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
  or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin';
$$;

drop policy if exists "Admins can read all profiles" on public.profiles;

create policy "Admins can read all profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can read all messages" on public.support_messages;

create policy "Admins can read all messages"
  on public.support_messages for select
  using (public.is_admin());

-- Ensure every auth user has a profile row
insert into public.profiles (id, name, role, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  case when u.raw_user_meta_data->>'role' = 'admin' then 'admin' else 'visitor' end,
  u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- Align profile role with auth metadata for admins
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and coalesce(u.raw_user_meta_data->>'role', '') = 'admin'
  and p.role is distinct from 'admin';

-- Backfill email on existing profiles
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');
