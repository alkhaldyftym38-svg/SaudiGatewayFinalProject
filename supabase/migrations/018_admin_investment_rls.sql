drop policy if exists "Admins manage investment_sectors" on public.investment_sectors;
drop policy if exists "Admins manage investment_steps" on public.investment_steps;
drop policy if exists "Admins manage vision_goals" on public.vision_goals;

create policy "Admins manage investment_sectors"
  on public.investment_sectors for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage investment_steps"
  on public.investment_steps for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage vision_goals"
  on public.vision_goals for all
  using (public.is_admin())
  with check (public.is_admin());
