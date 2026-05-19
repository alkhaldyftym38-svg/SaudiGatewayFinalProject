create table if not exists public.investment_sectors (
  id            text primary key,
  icon          text,
  name_en       text not null,
  name_ar       text not null,
  desc_en       text,
  desc_ar       text,
  color         text default '#C9A84C',
  opportunities integer default 0,
  growth        text,
  sort_order    integer default 0
);
alter table public.investment_sectors enable row level security;
create policy "Anyone reads investment_sectors" on public.investment_sectors for select using (true);
create policy "Admins manage investment_sectors" on public.investment_sectors for all
  using (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'))
  with check (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'));


create table if not exists public.investment_steps (
  step        integer primary key,
  title_en    text not null,
  title_ar    text not null,
  desc_en     text,
  desc_ar     text,
  link        text,
  icon        text,
  duration    text
);
alter table public.investment_steps enable row level security;
create policy "Anyone reads investment_steps" on public.investment_steps for select using (true);
create policy "Admins manage investment_steps" on public.investment_steps for all
  using (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'))
  with check (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'));


create table if not exists public.vision_goals (
  id        serial primary key,
  value     text not null,
  label_en  text not null,
  label_ar  text not null,
  sort_order integer default 0
);
alter table public.vision_goals enable row level security;
create policy "Anyone reads vision_goals" on public.vision_goals for select using (true);
create policy "Admins manage vision_goals" on public.vision_goals for all
  using (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'))
  with check (exists (select 1 from auth.users where id = auth.uid() and raw_user_meta_data->>'role'='admin'));


insert into public.investment_sectors (id,icon,name_en,name_ar,desc_en,desc_ar,color,opportunities,growth,sort_order) values
('s1','💻','Technology & Digital','التقنية والرقمنة','AI, cloud computing, cybersecurity, and digital transformation','الذكاء الاصطناعي والحوسبة السحابية والأمن السيبراني والتحول الرقمي','#2563EB',245,'+32%',1),
('s2','⚡','Renewable Energy','الطاقة المتجددة','Solar, wind, hydrogen, and green energy projects','الطاقة الشمسية وطاقة الرياح والهيدروجين ومشاريع الطاقة الخضراء','#16A34A',189,'+45%',2),
('s3','🏗️','Real Estate & Construction','العقارات والبناء','NEOM, Red Sea Project, and mega-infrastructure developments','نيوم ومشروع البحر الأحمر والمشاريع الضخمة','#D97706',312,'+28%',3),
('s4','🏨','Tourism & Hospitality','السياحة والضيافة','Hotels, resorts, entertainment venues, and travel services','الفنادق والمنتجعات وأماكن الترفيه وخدمات السفر','#C9A84C',276,'+38%',4),
('s5','🏥','Healthcare','الرعاية الصحية','Hospitals, pharmaceuticals, medical devices, and digital health','المستشفيات والأدوية والأجهزة الطبية والصحة الرقمية','#DC2626',198,'+22%',5),
('s6','🎓','Education & Training','التعليم والتدريب','Universities, EdTech, vocational training, and research centers','الجامعات وتقنية التعليم والتدريب المهني ومراكز البحث','#7C3AED',154,'+19%',6)
on conflict (id) do nothing;


insert into public.investment_steps (step,title_en,title_ar,desc_en,desc_ar,link,icon,duration) values
(1,'Register Your Business','سجّل نشاطك التجاري','Register with the Ministry of Commerce through the Invest Saudi platform','سجّل لدى وزارة التجارة عبر منصة استثمر في السعودية','https://investsaudi.sa','📋','1-3 days'),
(2,'Obtain Investment License','احصل على رخصة الاستثمار','Apply for a foreign investment license through MISA','تقدم بطلب رخصة الاستثمار الأجنبي عبر هيئة الاستثمار','https://misa.gov.sa','📜','3-7 days'),
(3,'Open a Bank Account','افتح حساباً بنكياً','Open a corporate bank account with a Saudi bank','افتح حساباً بنكياً للشركة لدى أحد البنوك السعودية','#','🏦','1-2 days'),
(4,'Register for Tax','سجّل للضرائب','Register with the Zakat, Tax and Customs Authority (ZATCA)','سجّل لدى هيئة الزكاة والضريبة والجمارك','https://zatca.gov.sa','💰','1-2 days'),
(5,'Register Employees','سجّل الموظفين','Register with GOSI and the Ministry of Human Resources','سجّل في التأمينات الاجتماعية ووزارة الموارد البشرية','https://gosi.gov.sa','👥','2-3 days')
on conflict (step) do nothing;


insert into public.vision_goals (value,label_en,label_ar,sort_order) values
('50%','from renewable energy','من الطاقة المتجددة',1),
('100M','tourists by 2030','سائح بحلول 2030',2),
('+1M','new jobs','وظيفة جديدة',3),
('50%','non-oil GDP','الناتج غير النفطي',4)
on conflict do nothing;
