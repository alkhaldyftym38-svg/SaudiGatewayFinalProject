insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;


create policy "Public read content-images"
  on storage.objects for select
  using (bucket_id = 'content-images');


create policy "Admins upload content-images"
  on storage.objects for insert
  with check (
    bucket_id = 'content-images'
    AND auth.role() = 'authenticated'
  );

create policy "Admins update content-images"
  on storage.objects for update
  using (
    bucket_id = 'content-images'
    AND auth.role() = 'authenticated'
  );

create policy "Admins delete content-images"
  on storage.objects for delete
  using (
    bucket_id = 'content-images'
    AND auth.role() = 'authenticated'
  );
