-- Site-wide settings (LLM keys, etc.) — admin-managed, read by Edge Functions via service role

create table if not exists public.site_settings (
  key         text primary key,
  value       text not null default '',
  is_secret   boolean not null default false,
  label_en    text,
  label_ar    text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

alter table public.site_settings enable row level security;

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.touch_site_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before insert or update on public.site_settings
  for each row execute function public.touch_site_settings();

insert into public.site_settings (key, value, is_secret, label_en, label_ar)
values
  ('groq_api_key', '', true, 'Groq API Key', 'مفتاح Groq API'),
  ('groq_model', 'llama-3.3-70b-versatile', false, 'Groq chat model', 'نموذج المحادثة')
on conflict (key) do nothing;
