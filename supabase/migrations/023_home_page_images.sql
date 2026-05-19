drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings for select
  using (is_secret = false);

insert into public.site_settings (key, value, is_secret, label_en, label_ar)
values
  (
    'home_image_hero_side',
    'https://www.telecomreviewarabia.com/images/stories/2025/02/saudi-arabia-achieves-significant-progress-in-the-e-government-development-index.jpg',
    false,
    'Home — hero side image',
    'الرئيسية — صورة الهيرو الجانبية'
  ),
  (
    'home_image_heritage',
    'https://makkahnewspaper.com/uploads/images/2023/12/26/1673717.jpeg',
    false,
    'Home — heritage card image',
    'الرئيسية — صورة بطاقة التراث'
  ),
  (
    'home_image_riyadh',
    'https://alawset.info/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B3%D8%B9%D9%88%D8%AF%D9%8A%D8%A9.jpg',
    false,
    'Home — Riyadh card image',
    'الرئيسية — صورة بطاقة الرياض'
  )
on conflict (key) do nothing;
