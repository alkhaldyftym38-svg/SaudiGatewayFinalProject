-- Ensure admins can read support messages (idempotent)

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

drop policy if exists "Admins can read all messages" on public.support_messages;

create policy "Admins can read all messages"
  on public.support_messages for select
  using (public.is_admin());
