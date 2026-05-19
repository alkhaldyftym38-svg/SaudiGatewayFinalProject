-- Allow admins to insert replies from dashboard (fallback if Edge Function not deployed)

drop policy if exists "Admins insert support replies" on public.support_message_replies;

create policy "Admins insert support replies"
  on public.support_message_replies for insert
  with check (public.is_admin());
