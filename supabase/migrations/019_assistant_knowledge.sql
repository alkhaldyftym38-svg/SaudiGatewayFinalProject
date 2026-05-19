create extension if not exists vector with schema extensions;

create table if not exists public.assistant_knowledge (
  id uuid primary key default gen_random_uuid(),
  topic_key text not null,
  lang text not null check (lang in ('en', 'ar')),
  title text not null,
  content text not null,
  links jsonb not null default '[]'::jsonb,
  keywords text[] not null default '{}',
  embedding extensions.vector(1536),
  search_vector tsvector,
  created_at timestamptz not null default now(),
  unique (topic_key, lang)
);

create or replace function public.assistant_knowledge_set_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(new.content, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(array_to_string(new.keywords, ' '), '')), 'A');
  return new;
end;
$$;

drop trigger if exists assistant_knowledge_search_vector_trigger on public.assistant_knowledge;
create trigger assistant_knowledge_search_vector_trigger
  before insert or update of title, content, keywords
  on public.assistant_knowledge
  for each row
  execute function public.assistant_knowledge_set_search_vector();

create index if not exists assistant_knowledge_lang_idx on public.assistant_knowledge (lang);
create index if not exists assistant_knowledge_search_idx on public.assistant_knowledge using gin (search_vector);

alter table public.assistant_knowledge enable row level security;

drop policy if exists "Anyone reads assistant knowledge" on public.assistant_knowledge;
create policy "Anyone reads assistant knowledge"
  on public.assistant_knowledge for select
  using (true);

drop policy if exists "Admins manage assistant knowledge" on public.assistant_knowledge;
create policy "Admins manage assistant knowledge"
  on public.assistant_knowledge for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.search_assistant_knowledge(
  p_query text,
  p_lang text,
  p_limit int default 3
)
returns table (
  id uuid,
  topic_key text,
  title text,
  content text,
  links jsonb,
  rank real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    k.id,
    k.topic_key,
    k.title,
    k.content,
    k.links,
    ts_rank(k.search_vector, websearch_to_tsquery('simple', coalesce(p_query, ''))) as rank
  from public.assistant_knowledge k
  where k.lang = p_lang
    and k.search_vector @@ websearch_to_tsquery('simple', coalesce(p_query, ''))
  order by rank desc
  limit greatest(p_limit, 1);
$$;

create or replace function public.match_assistant_knowledge(
  query_embedding extensions.vector(1536),
  p_lang text,
  match_threshold float default 0.5,
  match_count int default 3
)
returns table (
  id uuid,
  topic_key text,
  title text,
  content text,
  links jsonb,
  similarity float
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select
    k.id,
    k.topic_key,
    k.title,
    k.content,
    k.links,
    1 - (k.embedding <=> query_embedding) as similarity
  from public.assistant_knowledge k
  where k.lang = p_lang
    and k.embedding is not null
    and 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function public.search_assistant_knowledge(text, text, int) to anon, authenticated;
grant execute on function public.match_assistant_knowledge(extensions.vector(1536), text, float, int) to anon, authenticated;

create index if not exists assistant_knowledge_embedding_idx
  on public.assistant_knowledge using hnsw (embedding extensions.vector_cosine_ops);
