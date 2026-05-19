create table if not exists public.heritage_sites (
  id              text primary key,
  name_en         text not null,
  name_ar         text not null,
  category        text not null,
  location_en     text,
  location_ar     text,
  desc_en         text,
  desc_ar         text,
  image           text,
  rating          numeric(3,1) default 0,
  reviews         integer default 0,
  visit_hours_en  text,
  visit_hours_ar  text,
  permit_required boolean default false,
  tags            text[] default '{}',
  color           text default '#C9A84C',
  created_at      timestamptz default now()
);

alter table public.heritage_sites enable row level security;

create policy "Anyone can read heritage_sites"
  on public.heritage_sites for select using (true);

create policy "Admins can manage heritage_sites"
  on public.heritage_sites for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));



create table if not exists public.events (
  id          text primary key,
  title_en    text not null,
  title_ar    text not null,
  status      text not null default 'upcoming' check (status in ('ongoing','upcoming','past')),
  category    text,
  location_en text,
  location_ar text,
  date        date,
  end_date    date,
  desc_en     text,
  desc_ar     text,
  image       text,
  is_free     boolean default false,
  price       text,
  tags        text[] default '{}',
  color       text default '#C9A84C',
  organizer   text,
  website     text,
  created_at  timestamptz default now()
);

alter table public.events enable row level security;

create policy "Anyone can read events"
  on public.events for select using (true);

create policy "Admins can manage events"
  on public.events for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));



insert into public.heritage_sites (id,name_en,name_ar,category,location_en,location_ar,desc_en,desc_ar,image,rating,reviews,visit_hours_en,visit_hours_ar,permit_required,tags,color)
values
('h1','Al-Hijr (Madain Saleh)','الحِجر (مدائن صالح)','UNESCO','Al-Ula, Medina Region','العُلا، منطقة المدينة المنورة','Saudi Arabia''s first UNESCO World Heritage Site, featuring ancient Nabataean tombs carved into sandstone.','أول موقع للتراث العالمي لليونسكو في المملكة، يضم مقابر نبطية قديمة منحوتة في الحجر الرملي.','https://images.unsplash.com/photo-1578894382863-2fa7fd8e50f1?w=600&q=80',4.9,2847,'8:00 AM - 6:00 PM','٨:٠٠ ص - ٦:٠٠ م',true,'{UNESCO,Nabataean,Rock-cut}','#C9A84C'),
('h2','Diriyah','الدرعية','historical','Riyadh','الرياض','The original home of the Saudi royal family and a UNESCO World Heritage Site, featuring mud-brick architecture.','الموطن الأصلي للأسرة الملكية السعودية وموقع للتراث العالمي لليونسكو، يتميز بالعمارة الطينية.','https://images.unsplash.com/photo-1586183189334-8c4d40c6cb87?w=600&q=80',4.8,3621,'9:00 AM - 10:00 PM','٩:٠٠ ص - ١٠:٠٠ م',false,'{UNESCO,Historical,Architecture}','#006C35'),
('h3','Al-Ahsa Oasis','واحة الأحساء','UNESCO','Eastern Province','المنطقة الشرقية','The world''s largest natural oasis, a UNESCO site with date palm groves, gardens, and historical sites.','أكبر واحة طبيعية في العالم، موقع يونسكو بأشجار النخيل والحدائق والمواقع التاريخية.','https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',4.7,1956,'Open daily','مفتوح يومياً',false,'{UNESCO,Natural,Agriculture}','#8B6914'),
('h4','Hegra Archaeological Site','موقع الحِجر الأثري','UNESCO','Al-Ula','العُلا','Home to 111 well-preserved tombs of the Nabataean civilization dating back 2,000 years.','يضم ١١١ مقبرة محفوظة جيداً تعود إلى الحضارة النبطية منذ ٢٠٠٠ عام.','https://images.unsplash.com/photo-1570993492898-5b17b8a4836b?w=600&q=80',4.9,2134,'8:00 AM - 5:00 PM','٨:٠٠ ص - ٥:٠٠ م',true,'{UNESCO,Archaeological,Nabataean}','#A07828'),
('h5','Jeddah Historic District','جدة التاريخية','UNESCO','Jeddah','جدة','Al-Balad, the historic core of Jeddah with centuries-old coral-stone buildings and wooden latticed balconies.','البلد، قلب جدة التاريخي بمبانيه المرجانية ذات الشرافات الخشبية العريقة.','https://images.unsplash.com/photo-1568024297703-3dca20cf1a8c?w=600&q=80',4.6,4823,'10:00 AM - 11:00 PM','١٠:٠٠ ص - ١١:٠٠ م',false,'{UNESCO,Cultural,Architecture}','#2563EB'),
('h6','Edge of the World','حافة العالم','natural','Riyadh Region','منطقة الرياض','A dramatic escarpment offering breathtaking views of the Nefud desert, stretching as far as the eye can see.','منحدر درامي يوفر مناظر رائعة على صحراء النفود المترامية الأطراف.','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',4.8,3102,'Sunrise to Sunset','من الشروق إلى الغروب',false,'{Natural,Adventure,Desert}','#DC2626')
on conflict (id) do nothing;



insert into public.events (id,title_en,title_ar,status,category,location_en,location_ar,date,end_date,desc_en,desc_ar,image,is_free,price,tags,color,organizer,website)
values
('e1','Riyadh Season','موسم الرياض','ongoing','entertainment','Riyadh','الرياض','2026-10-01','2027-03-31','The world''s largest entertainment event featuring concerts, sports, art, and culinary experiences.','أكبر حدث ترفيهي في العالم يضم حفلات موسيقية ورياضة وفن وتجارب طهي.','https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',false,'Varies','{Entertainment,Culture,Music}','#C9A84C','General Entertainment Authority','https://riyadhseason.com.sa'),
('e2','Jeddah Season','موسم جدة','upcoming','entertainment','Jeddah','جدة','2026-06-01','2026-09-30','A summer season of entertainment, culture, and family activities in the port city of Jeddah.','موسم صيفي من الترفيه والثقافة والأنشطة العائلية في مدينة جدة.','https://images.unsplash.com/photo-1524781289445-ddf8f5695861?w=600&q=80',false,'Varies','{Entertainment,Family,Summer}','#2563EB','General Entertainment Authority','#'),
('e3','Hegra International Festival','مهرجان الحِجر الدولي','upcoming','cultural','Al-Ula','العُلا','2026-11-15','2026-12-15','An international arts and culture festival set against the stunning backdrop of Al-Ula.','مهرجان دولي للفنون والثقافة على خلفية العُلا الخلابة.','https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=600&q=80',false,'From SAR 250','{Art,Culture,Heritage}','#006C35','Royal Commission for AlUla','#'),
('e4','Saudi Food Festival','مهرجان الطعام السعودي','upcoming','food','Multiple Cities','عدة مدن','2026-04-10','2026-04-20','Celebrating Saudi cuisine and food culture from across the Kingdom and the Arab world.','احتفال بالمطبخ السعودي وثقافة الطعام من جميع أنحاء المملكة والعالم العربي.','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',true,'Free','{Food,Culture,Family}','#DC2626','Ministry of Culture','#'),
('e5','Saudi Green Initiative Forum','منتدى مبادرة السعودية الخضراء','upcoming','environment','Riyadh','الرياض','2026-10-23','2026-10-25','Global forum discussing sustainability and environmental initiatives in Saudi Arabia.','منتدى عالمي لمناقشة مبادرات الاستدامة والبيئة في المملكة.','https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&q=80',false,'Registration Required','{Environment,Sustainability,Forum}','#16A34A','Saudi Vision 2030','#'),
('e6','Taif Rose Festival','مهرجان ورد الطائف','upcoming','cultural','Taif','الطائف','2026-03-20','2026-04-05','Celebrate the blooming of Taif''s famous roses with cultural performances and rose products.','احتفل بازدهار ورود الطائف الشهيرة مع العروض الثقافية ومنتجات الورود.','https://images.unsplash.com/photo-1490750967868-88df5691cc35?w=600&q=80',true,'Free','{Nature,Culture,Festival}','#DB2777','Taif Municipality','#')
on conflict (id) do nothing;
