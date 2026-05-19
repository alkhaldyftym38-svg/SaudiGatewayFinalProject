insert into public.assistant_knowledge (topic_key, lang, title, content, links, keywords) values
(
  'tech_company',
  'en',
  'Starting a tech company in Riyadh',
  $$To start a tech company in Riyadh, Saudi Arabia, here are the key steps:

**1. Business Registration**
Register your company through the **Ministry of Commerce** portal (mc.gov.sa) or the **Invest Saudi** platform.

**2. Investment License**
Apply for a Foreign Investment License through **MISA** at misa.gov.sa

**3. Required Documents**
- Passport copies of all founders
- Business plan
- Financial statements
- Memorandum of Association

The process typically takes **7-14 business days**.$$,
  '[{"label":"Ministry of Commerce","url":"https://mc.gov.sa"},{"label":"MISA Platform","url":"https://misa.gov.sa"},{"label":"Monshaat","url":"https://monshaat.gov.sa"}]'::jsonb,
  array['tech', 'technology', 'startup', 'company', 'riyadh', 'misa', 'commerce']
),
(
  'tech_company',
  'ar',
  'بدء شركة تقنية في الرياض',
  $$لبدء شركة تقنية في الرياض:

**١. تسجيل الأعمال** عبر وزارة التجارة أو استثمر في السعودية.
**٢. رخصة الاستثمار** عبر هيئة الاستثمار (MISA).
**٣. المستندات:** جوازات، خطة عمل، بيانات مالية، عقد تأسيس.

تستغرق العملية عادةً **٧-١٤ يوم عمل**.$$,
  '[{"label":"وزارة التجارة","url":"https://mc.gov.sa"},{"label":"منصة MISA","url":"https://misa.gov.sa"},{"label":"منشآت","url":"https://monshaat.gov.sa"}]'::jsonb,
  array['تقنية', 'شركة', 'رياض', 'استثمار', 'misa', 'تجارة', 'startup']
),
(
  'visa',
  'en',
  'Saudi tourist visa',
  $$Saudi Arabia tourist visa requirements:

**Tourist eVisa Requirements:**
- Valid passport (6+ months validity)
- Travel insurance
- Return/onward ticket

**How to Apply:**
1. Visit **visitsaudi.com** or **Absher**
2. Fill the online application and pay fees
3. Receive eVisa via email

**Visa on Arrival** is available for citizens of 49 countries.$$,
  '[{"label":"Visit Saudi","url":"https://visitsaudi.com"},{"label":"Absher Platform","url":"https://www.absher.sa"}]'::jsonb,
  array['visa', 'tourist', 'evisa', 'absher', 'visitsaudi', 'travel']
),
(
  'visa',
  'ar',
  'تأشيرة السياحة السعودية',
  $$متطلبات تأشيرة السياحة:

- جواز سفر ساري 6 أشهر على الأقل
- تأمين سفر وتذكرة عودة

**التقديم:** visitsaudi.com أو أبشر، ثم دفع الرسوم واستلام التأشيرة إلكترونياً.

**تأشيرة عند الوصول** لـ 49 دولة.$$,
  '[{"label":"زيارة السعودية","url":"https://visitsaudi.com"},{"label":"منصة أبشر","url":"https://www.absher.sa"}]'::jsonb,
  array['تأشيرة', 'سياحة', 'أبشر', 'جواز', 'visitsaudi']
),
(
  'heritage_permit',
  'en',
  'Heritage site permits',
  $$To obtain permits for heritage sites in Saudi Arabia:

Apply through the **Saudi Heritage Commission** at **her.gov.sa** for excavation, filming, or research.

**Steps:** submit application, documentation, fees; permit in 5-10 business days.

**Tourist visits** to UNESCO sites often require booking via **Experience AlUla**.$$,
  '[{"label":"Saudi Heritage Commission","url":"https://her.gov.sa"},{"label":"Experience AlUla","url":"https://www.experiencealula.com"}]'::jsonb,
  array['heritage', 'permit', 'unesco', 'hegra', 'alula']
),
(
  'heritage_permit',
  'ar',
  'تصاريح المواقع التراثية',
  $$تصاريح المواقع التراثية عبر **هيئة التراث السعودية** على her.gov.sa.

**الخطوات:** تقديم الطلب، الوثائق، الرسوم، ثم التصريح خلال ٥-١٠ أيام.

**الزيارات السياحية** لمواقع اليونسكو غالباً عبر **اكتشف العُلا**.$$,
  '[{"label":"هيئة التراث السعودية","url":"https://her.gov.sa"},{"label":"اكتشف العُلا","url":"https://www.experiencealula.com"}]'::jsonb,
  array['تراث', 'تصريح', 'حجر', 'العلا', 'يونسكو', 'heritage']
),
(
  'platform',
  'en',
  'Saudi Gateway platform',
  $$Saudi Gateway helps you explore heritage, events, and investment in Arabic and English.

Browse **Heritage**, **Events**, and **Investment**. Use **Favorites** when signed in. Contact **Support** for human help.$$,
  '[{"label":"Heritage","url":"/heritage"},{"label":"Events","url":"/events"},{"label":"Investment","url":"/investment"},{"label":"Support","url":"/support"}]'::jsonb,
  array['gateway', 'heritage', 'events', 'investment', 'platform']
),
(
  'platform',
  'ar',
  'منصة بوابة السعودية',
  $$بوابة السعودية تجمع التراث والفعاليات والاستثمار بالعربية والإنجليزية.

تصفّح **التراث** و**الفعاليات** و**الاستثمار**. استخدم **المفضلة** بعد تسجيل الدخول. **الدعم** للمساعدة البشرية.$$,
  '[{"label":"التراث","url":"/heritage"},{"label":"الفعاليات","url":"/events"},{"label":"الاستثمار","url":"/investment"},{"label":"الدعم","url":"/support"}]'::jsonb,
  array['بوابة', 'تراث', 'فعاليات', 'استثمار', 'منصة']
)
on conflict (topic_key, lang) do update set
  title = excluded.title,
  content = excluded.content,
  links = excluded.links,
  keywords = excluded.keywords;
