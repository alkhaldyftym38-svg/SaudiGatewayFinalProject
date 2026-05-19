UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = lower('CHANGE_ME@example.com') LIMIT 1
);
