-- Support message workflow for admins

alter table public.support_messages
  add column if not exists status text not null default 'pending';

alter table public.support_messages
  drop constraint if exists support_messages_status_check;

alter table public.support_messages
  add constraint support_messages_status_check
  check (status in ('pending', 'read', 'resolved'));

create index if not exists support_messages_status_idx
  on public.support_messages (status);

drop policy if exists "Admins can update messages" on public.support_messages;

create policy "Admins can update messages"
  on public.support_messages for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete messages" on public.support_messages;

create policy "Admins can delete messages"
  on public.support_messages for delete
  using (public.is_admin());
