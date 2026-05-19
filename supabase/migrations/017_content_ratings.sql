-- Unified ratings for heritage, events, investment sectors, etc.

create table if not exists public.content_ratings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_type   text not null check (item_type in ('heritage', 'event', 'investment')),
  item_id     text not null,
  rating      smallint not null check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create index if not exists content_ratings_item_idx
  on public.content_ratings (item_type, item_id);

create index if not exists content_ratings_created_idx
  on public.content_ratings (created_at desc);

-- Migrate existing heritage ratings
insert into public.content_ratings (user_id, item_type, item_id, rating, created_at)
select user_id, 'heritage', site_id::text, rating, created_at
from public.heritage_ratings
on conflict (user_id, item_type, item_id) do nothing;

alter table public.content_ratings enable row level security;

create policy "Users manage own content ratings"
  on public.content_ratings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read content ratings"
  on public.content_ratings for select
  using (true);

create policy "Admins can delete any content rating"
  on public.content_ratings for delete
  using (public.is_admin());
