create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  role        text not null default 'visitor' check (role in ('visitor','admin')),
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    'visitor'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();



create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  item_type   text not null check (item_type in ('heritage','event')),
  title       text,
  image       text,
  created_at  timestamptz not null default now(),
  unique (user_id, item_id)
);
alter table public.favorites enable row level security;

create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);



create table if not exists public.heritage_ratings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  site_id     text not null,
  rating      smallint not null check (rating between 1 and 5),
  created_at  timestamptz not null default now(),
  unique (user_id, site_id)
);
alter table public.heritage_ratings enable row level security;

create policy "Users manage own ratings"
  on public.heritage_ratings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read ratings"
  on public.heritage_ratings for select
  using (true);



create table if not exists public.saved_answers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  question    text not null,
  answer      text not null,
  links       jsonb default '[]',
  saved_at    timestamptz not null default now()
);
alter table public.saved_answers enable row level security;

create policy "Users manage own saved answers"
  on public.saved_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);



create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text,
  message     text not null,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.support_messages enable row level security;

create policy "Anyone can insert support message"
  on public.support_messages for insert
  with check (true);

create policy "Admins can read all messages"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
