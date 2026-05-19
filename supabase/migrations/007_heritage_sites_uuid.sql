-- Convert heritage_sites.id from text (h1, h2, …) to uuid
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'heritage_sites'
      and column_name = 'id'
      and data_type = 'text'
  ) then
    return;
  end if;

  create table if not exists public._heritage_id_map (
    old_id text primary key,
    new_id uuid not null default gen_random_uuid()
  );

  insert into public._heritage_id_map (old_id)
  select id from public.heritage_sites
  on conflict (old_id) do nothing;

  alter table public.heritage_sites add column if not exists id_uuid uuid;

  update public.heritage_sites h
  set id_uuid = m.new_id
  from public._heritage_id_map m
  where h.id = m.old_id;

  update public.heritage_ratings r
  set site_id = m.new_id::text
  from public._heritage_id_map m
  where r.site_id = m.old_id;

  update public.favorites f
  set item_id = m.new_id::text
  from public._heritage_id_map m
  where f.item_type = 'heritage' and f.item_id = m.old_id;

  alter table public.heritage_sites drop constraint heritage_sites_pkey;
  alter table public.heritage_sites drop column id;
  alter table public.heritage_sites rename column id_uuid to id;
  alter table public.heritage_sites alter column id set not null;
  alter table public.heritage_sites alter column id set default gen_random_uuid();
  alter table public.heritage_sites add primary key (id);

  alter table public.heritage_ratings
    alter column site_id type uuid using site_id::uuid;

  drop table public._heritage_id_map;
end $$;
