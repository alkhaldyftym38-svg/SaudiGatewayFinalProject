-- Admin replies to support messages (email sent via Edge Function)

create table if not exists public.support_message_replies (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.support_messages(id) on delete cascade,
  admin_id    uuid references auth.users(id) on delete set null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists support_message_replies_message_id_idx
  on public.support_message_replies (message_id);

alter table public.support_messages
  add column if not exists last_reply_at timestamptz;

alter table public.support_message_replies enable row level security;

drop policy if exists "Admins read support replies" on public.support_message_replies;

create policy "Admins read support replies"
  on public.support_message_replies for select
  using (public.is_admin());
