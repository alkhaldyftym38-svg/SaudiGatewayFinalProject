-- Convert events.id from text (e1, e2, …) to uuid
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'id'
      and data_type = 'text'
  ) then
    return;
  end if;

  create table if not exists public._events_id_map (
    old_id text primary key,
    new_id uuid not null default gen_random_uuid()
  );

  insert into public._events_id_map (old_id)
  select id from public.events
  on conflict (old_id) do nothing;

  alter table public.events add column if not exists id_uuid uuid;

  update public.events e
  set id_uuid = m.new_id
  from public._events_id_map m
  where e.id = m.old_id;

  update public.favorites f
  set item_id = m.new_id::text
  from public._events_id_map m
  where f.item_type = 'event' and f.item_id = m.old_id;

  alter table public.events drop constraint events_pkey;
  alter table public.events drop column id;
  alter table public.events rename column id_uuid to id;
  alter table public.events alter column id set not null;
  alter table public.events alter column id set default gen_random_uuid();
  alter table public.events add primary key (id);

  drop table public._events_id_map;
end $$;
