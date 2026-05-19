-- =============================================================================
-- Saudi Gateway — demo seed for assistant + public pages
-- Run once in Supabase SQL Editor or: supabase db push / migration apply
-- Idempotent: fixed UUIDs / keys → ON CONFLICT … DO UPDATE
-- =============================================================================

-- ─── Heritage sites (assistant: heritage_sites) ─────────────────────────────

insert into public.heritage_sites (
  id, name_en, name_ar, category, location_en, location_ar,
  desc_en, desc_ar, image, rating, reviews,
  visit_hours_en, visit_hours_ar, permit_required, tags, color
) values
(
  'a1000001-0001-4001-8001-000000000001',
  'Al-Hijr (Madain Saleh)',
  'الحِجر (مدائن صالح)',
  'UNESCO',
  'Al-Ula, Medina Region',
  'العُلا، منطقة المدينة المنورة',
  'Saudi Arabia''s first UNESCO World Heritage Site with Nabataean tombs carved in sandstone.',
  'أول موقع تراث عالمي لليونسكو في المملكة، مقابر نبطية منحوتة في الحجر الرملي.',
  'https://images.unsplash.com/photo-1578894382863-2fa7fd8e50f1?w=600&q=80',
  4.9, 2847,
  '8:00 AM - 6:00 PM', '٨:٠٠ ص - ٦:٠٠ م',
  true, '{UNESCO,Nabataean,Rock-cut}', '#C9A84C'
),
(
  'a1000001-0001-4001-8001-000000000002',
  'Diriyah (At-Turaif)',
  'الدرعية (الطريف)',
  'UNESCO',
  'Riyadh',
  'الرياض',
  'Historic capital of the First Saudi State; mud-brick architecture and cultural district.',
  'عاصمة الدولة السعودية الأولى؛ عمارة طينية وحي ثقافي.',
  'https://images.unsplash.com/photo-1586183189334-8c4d40c6cb87?w=600&q=80',
  4.8, 3621,
  '9:00 AM - 10:00 PM', '٩:٠٠ ص - ١٠:٠٠ م',
  false, '{UNESCO,Historical,Architecture}', '#006C35'
),
(
  'a1000001-0001-4001-8001-000000000003',
  'Al-Ahsa Oasis',
  'واحة الأحساء',
  'UNESCO',
  'Eastern Province',
  'المنطقة الشرقية',
  'World''s largest oasis with date palms, gardens, and heritage sites.',
  'أكبر واحة طبيعية في العالم بأشجار النخيل والحدائق والمواقع التاريخية.',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',
  4.7, 1956,
  'Open daily', 'مفتوح يومياً',
  false, '{UNESCO,Natural,Agriculture}', '#8B6914'
),
(
  'a1000001-0001-4001-8001-000000000004',
  'Jeddah Historic District (Al-Balad)',
  'جدة التاريخية (البلد)',
  'UNESCO',
  'Jeddah',
  'جدة',
  'Coral-stone houses and wooden rawashin balconies in the old port city.',
  'مبانٍ مرجانية وشرافات خشبية في قلب المدينة القديمة.',
  'https://images.unsplash.com/photo-1568024297703-3dca20cf1a8c?w=600&q=80',
  4.6, 4823,
  '10:00 AM - 11:00 PM', '١٠:٠٠ ص - ١١:٠٠ م',
  false, '{UNESCO,Cultural,Architecture}', '#2563EB'
),
(
  'a1000001-0001-4001-8001-000000000005',
  'Edge of the World',
  'حافة العالم',
  'natural',
  'Riyadh Region',
  'منطقة الرياض',
  'Dramatic Tuwaiq escarpment with views over the Nefud desert.',
  'منحدر طويق بإطلالات على صحراء النفود.',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  4.8, 3102,
  'Sunrise to Sunset', 'من الشروق إلى الغروب',
  false, '{Natural,Adventure,Desert}', '#DC2626'
),
(
  'a1000001-0001-4001-8001-000000000006',
  'Historic Jeddah Gate — Bab Makkah',
  'باب مكة التاريخي',
  'historical',
  'Jeddah',
  'جدة',
  'Historic gateway linking pilgrims to the Holy Cities.',
  'بوابة تاريخية على طريق الحجاج إلى المشاعر المقدسة.',
  'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=600&q=80',
  4.5, 890,
  '9:00 AM - 9:00 PM', '٩:٠٠ ص - ٩:٠٠ م',
  false, '{Historical,Cultural}', '#C9A84C'
)
on conflict (id) do update set
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  category = excluded.category,
  location_en = excluded.location_en,
  location_ar = excluded.location_ar,
  desc_en = excluded.desc_en,
  desc_ar = excluded.desc_ar,
  image = excluded.image,
  rating = excluded.rating,
  reviews = excluded.reviews,
  visit_hours_en = excluded.visit_hours_en,
  visit_hours_ar = excluded.visit_hours_ar,
  permit_required = excluded.permit_required,
  tags = excluded.tags,
  color = excluded.color;


-- ─── Events (assistant: events — status upcoming/ongoing for «الفعاليات القادمة») ─

insert into public.events (
  id, title_en, title_ar, status, category,
  location_en, location_ar, date, end_date,
  desc_en, desc_ar, image, is_free, price,
  tags, color, organizer, website
) values
(
  'b2000001-0001-4001-8001-000000000001',
  'Riyadh Season',
  'موسم الرياض',
  'ongoing',
  'entertainment',
  'Riyadh', 'الرياض',
  '2025-10-15', '2026-05-31',
  'Mega entertainment season: concerts, sports, dining, and family zones across Riyadh.',
  'موسم ترفيه ضخم: حفلات ورياضة ومطاعم وأنشطة عائلية في الرياض.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  false, 'Varies',
  '{Entertainment,Culture,Music}', '#C9A84C',
  'General Entertainment Authority', 'https://riyadhseason.com.sa'
),
(
  'b2000001-0001-4001-8001-000000000002',
  'Jeddah Season',
  'موسم جدة',
  'upcoming',
  'entertainment',
  'Jeddah', 'جدة',
  '2026-06-01', '2026-09-30',
  'Summer entertainment and culture on the Red Sea coast.',
  'ترفيه وثقافة صيفية على ساحل البحر الأحمر.',
  'https://images.unsplash.com/photo-1524781289445-ddf8f5695861?w=600&q=80',
  false, 'From SAR 50',
  '{Entertainment,Family,Summer}', '#2563EB',
  'General Entertainment Authority', 'https://www.jeddahseason.sa'
),
(
  'b2000001-0001-4001-8001-000000000003',
  'Hegra International Festival',
  'مهرجان الحِجر الدولي',
  'upcoming',
  'cultural',
  'Al-Ula', 'العُلا',
  '2026-11-15', '2026-12-15',
  'Arts and culture festival among Nabataean heritage landscapes.',
  'مهرجان فنون وثقافة وسط مناظر التراث النبطي.',
  'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=600&q=80',
  false, 'From SAR 250',
  '{Art,Culture,Heritage}', '#006C35',
  'Royal Commission for AlUla', 'https://www.experiencealula.com'
),
(
  'b2000001-0001-4001-8001-000000000004',
  'Saudi Food Festival',
  'مهرجان الطعام السعودي',
  'upcoming',
  'food',
  'Riyadh', 'الرياض',
  '2026-05-25', '2026-06-05',
  'Celebration of Saudi cuisine, chefs, and regional dishes.',
  'احتفال بالمطبخ السعودي والطهاة والأطباق الإقليمية.',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
  true, 'Free',
  '{Food,Culture,Family}', '#DC2626',
  'Ministry of Culture', 'https://www.moc.gov.sa'
),
(
  'b2000001-0001-4001-8001-000000000005',
  'Taif Rose Festival',
  'مهرجان ورد الطائف',
  'upcoming',
  'cultural',
  'Taif', 'الطائف',
  '2026-04-01', '2026-04-20',
  'Rose harvest season with markets, perfumes, and cultural shows.',
  'موسم قطف الورد مع أسواق وعطور وعروض ثقافية.',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc35?w=600&q=80',
  true, 'Free',
  '{Nature,Culture,Festival}', '#DB2777',
  'Taif Municipality', 'https://www.taifcity.gov.sa'
),
(
  'b2000001-0001-4001-8001-000000000006',
  'Saudi Green Initiative Forum',
  'منتدى مبادرة السعودية الخضراء',
  'upcoming',
  'environment',
  'Riyadh', 'الرياض',
  '2026-10-23', '2026-10-25',
  'Global forum on sustainability, renewables, and climate action in the Kingdom.',
  'منتدى عالمي للاستدامة والطاقة المتجددة والعمل المناخي في المملكة.',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80',
  false, 'Registration required',
  '{Environment,Sustainability,Forum}', '#16A34A',
  'Saudi Green Initiative', 'https://www.saudigreeninitiative.com'
),
(
  'b2000001-0001-4001-8001-000000000007',
  'MDLBEAST Soundstorm',
  'ساوندستورم MDLBEAST',
  'upcoming',
  'music',
  'Riyadh', 'الرياض',
  '2026-12-11', '2026-12-13',
  'One of the region''s largest electronic music festivals.',
  'من أكبر مهرجانات الموسيقى الإلكترونية في المنطقة.',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
  false, 'From SAR 295',
  '{Music,Entertainment,Festival}', '#7C3AED',
  'MDLBEAST', 'https://mdlbeast.com'
),
(
  'b2000001-0001-4001-8001-000000000008',
  'Red Sea International Film Festival',
  'مهرجان البحر الأحمر السينمائي الدولي',
  'upcoming',
  'cultural',
  'Jeddah', 'جدة',
  '2026-11-28', '2026-12-07',
  'International cinema showcase on the Red Sea waterfront.',
  'عرض سينمائي دولي على واجهة البحر الأحمر.',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  false, 'Ticketed',
  '{Film,Culture,International}', '#0EA5E9',
  'Red Sea Film Foundation', 'https://www.redseafilmfest.com'
),
(
  'b2000001-0001-4001-8001-000000000009',
  'Al-Ula Wellness Festival',
  'مهرجان العُلا للعافية',
  'upcoming',
  'wellness',
  'Al-Ula', 'العُلا',
  '2026-02-10', '2026-02-23',
  'Wellness retreats, yoga, and desert experiences in Al-Ula.',
  'خلوات عافية ويوغا وتجارب صحراوية في العُلا.',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
  false, 'From SAR 180',
  '{Wellness,Health,Tourism}', '#059669',
  'Royal Commission for AlUla', 'https://www.experiencealula.com'
),
(
  'b2000001-0001-4001-8001-000000000010',
  'Janadriyah National Heritage Festival',
  'مهرجان الجنادرية للتراث الوطني',
  'past',
  'cultural',
  'Riyadh', 'الرياض',
  '2026-02-01', '2026-02-15',
  'Annual national heritage and folk culture festival (recent edition).',
  'المهرجان الوطني السنوي للتراث والفلكلور (نسخة حديثة).',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
  true, 'Free',
  '{Heritage,Culture,National}', '#C9A84C',
  'Ministry of National Guard', 'https://www.janadriyah.sa'
)
on conflict (id) do update set
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  status = excluded.status,
  category = excluded.category,
  location_en = excluded.location_en,
  location_ar = excluded.location_ar,
  date = excluded.date,
  end_date = excluded.end_date,
  desc_en = excluded.desc_en,
  desc_ar = excluded.desc_ar,
  image = excluded.image,
  is_free = excluded.is_free,
  price = excluded.price,
  tags = excluded.tags,
  color = excluded.color,
  organizer = excluded.organizer,
  website = excluded.website;


-- ─── Investment (assistant: investment_sectors + investment_steps) ────────────

insert into public.investment_sectors (
  id, icon, name_en, name_ar, desc_en, desc_ar,
  color, opportunities, growth, sort_order
) values
('s1', '💻', 'Technology & Digital', 'التقنية والرقمنة',
 'AI, cloud, cybersecurity, and digital government services.',
 'الذكاء الاصطناعي والسحابة والأمن السيبراني والخدمات الرقمية.',
 '#2563EB', 245, '+32%', 1),
('s2', '⚡', 'Renewable Energy', 'الطاقة المتجددة',
 'Solar, wind, green hydrogen, and grid modernization.',
 'الشمسية والرياح والهيدروجين الأخضر وتحديث الشبكات.',
 '#16A34A', 189, '+45%', 2),
('s3', '🏗️', 'Real Estate & Construction', 'العقارات والبناء',
 'Giga-projects: NEOM, Red Sea, Qiddiya, and housing.',
 'المشاريع العملاقة: نيوم والبحر الأحمر والقدية والإسكان.',
 '#D97706', 312, '+28%', 3),
('s4', '🏨', 'Tourism & Hospitality', 'السياحة والضيافة',
 'Hotels, resorts, entertainment, and travel tech.',
 'الفنادق والمنتجعات والترفيه وتقنية السفر.',
 '#C9A84C', 276, '+38%', 4),
('s5', '🏥', 'Healthcare', 'الرعاية الصحية',
 'Hospitals, biotech, medical devices, and digital health.',
 'المستشفيات والتقنية الحيوية والأجهزة والصحة الرقمية.',
 '#DC2626', 198, '+22%', 5),
('s6', '🎓', 'Education & Training', 'التعليم والتدريب',
 'Universities, EdTech, vocational training, and R&D.',
 'الجامعات وتقنية التعليم والتدريب المهني والبحث.',
 '#7C3AED', 154, '+19%', 6),
('s7', '🚢', 'Logistics & Transport', 'اللوجستيات والنقل',
 'Ports, rail, aviation, and supply-chain hubs.',
 'الموانئ والسكك والطيران ومراكز سلاسل الإمداد.',
 '#0891B2', 167, '+26%', 7),
('s8', '🎮', 'Gaming & Esports', 'الألعاب والرياضات الإلكترونية',
 'Game studios, publishing, and esports venues.',
 'استوديوهات الألعاب والنشر وقاعات الرياضات الإلكترونية.',
 '#BE185D', 132, '+41%', 8)
on conflict (id) do update set
  icon = excluded.icon,
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  desc_en = excluded.desc_en,
  desc_ar = excluded.desc_ar,
  color = excluded.color,
  opportunities = excluded.opportunities,
  growth = excluded.growth,
  sort_order = excluded.sort_order;


insert into public.investment_steps (
  step, title_en, title_ar, desc_en, desc_ar, link, icon, duration
) values
(1, 'Register Your Business', 'سجّل نشاطك التجاري',
 'Register with the Ministry of Commerce via Invest Saudi.',
 'سجّل لدى وزارة التجارة عبر استثمر في السعودية.',
 'https://investsaudi.sa', '📋', '1-3 days'),
(2, 'Obtain Investment License', 'احصل على رخصة الاستثمار',
 'Apply for a foreign investment license through MISA.',
 'تقدّم لرخصة الاستثمار الأجنبي عبر هيئة الاستثمار.',
 'https://misa.gov.sa', '📜', '3-7 days'),
(3, 'Open a Bank Account', 'افتح حساباً بنكياً',
 'Open a corporate account with a licensed Saudi bank.',
 'افتح حساباً للشركة لدى بنك سعودي مرخّص.',
 'https://www.sama.gov.sa', '🏦', '1-2 days'),
(4, 'Register for Tax', 'سجّل للضرائب',
 'Register with ZATCA for VAT and corporate obligations.',
 'سجّل لدى هيئة الزكاة والضريبة والجمارك.',
 'https://zatca.gov.sa', '💰', '1-2 days'),
(5, 'Register Employees', 'سجّل الموظفين',
 'GOSI and Ministry of Human Resources registration.',
 'التأمينات الاجتماعية ووزارة الموارد البشرية.',
 'https://gosi.gov.sa', '👥', '2-3 days'),
(6, 'Launch Operations', 'ابدأ التشغيل',
 'Obtain municipal licenses and start commercial activity.',
 'رخص البلدية وبدء النشاط التجاري.',
 'https://www.mc.gov.sa', '🚀', '3-10 days')
on conflict (step) do update set
  title_en = excluded.title_en,
  title_ar = excluded.title_ar,
  desc_en = excluded.desc_en,
  desc_ar = excluded.desc_ar,
  link = excluded.link,
  icon = excluded.icon,
  duration = excluded.duration;


insert into public.vision_goals (value, label_en, label_ar, sort_order)
select v.value, v.label_en, v.label_ar, v.sort_order
from (values
  ('50%', 'from renewable energy', 'من الطاقة المتجددة', 1),
  ('100M', 'tourists by 2030', 'سائح بحلول 2030', 2),
  ('+1M', 'new jobs', 'وظيفة جديدة', 3),
  ('50%', 'non-oil GDP', 'الناتج غير النفطي', 4)
) as v(value, label_en, label_ar, sort_order)
where not exists (
  select 1 from public.vision_goals g where g.label_en = v.label_en
);
