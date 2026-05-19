-- Allow admins to remove inappropriate heritage ratings

drop policy if exists "Admins can delete any rating" on public.heritage_ratings;

create policy "Admins can delete any rating"
  on public.heritage_ratings for delete
  using (public.is_admin());
