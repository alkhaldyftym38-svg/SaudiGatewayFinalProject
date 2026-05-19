import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  TrendingUp, ExternalLink,
  Zap, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StarRating from '../components/ui/StarRating';
import { supabase } from '../lib/supabaseClient';
import { withTimeout } from '../lib/queryTimeout';
import { PageHeroLight, LightHeroBadge, LightHeroStatCard } from '../components/layout/PageHeroLight';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function SectorCard({ sector, lang, t }) {
  const { getUserRating, rateContent } = useApp();
  const userRating = getUserRating('investment', sector.id);
  const name = lang === 'ar' ? sector.name_ar : sector.name_en;
  const desc = lang === 'ar' ? sector.desc_ar : sector.desc_en;

  return (
    <motion.div
      variants={fadeUp}
      className="bg-surface-container-lowest rounded-3xl p-6 shadow-card hover:shadow-majlis transition-shadow duration-300 group cursor-pointer border border-outline-variant/10"
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${sector.color}15` }}
      >
        {sector.icon}
      </div>
      <h3 className="font-bold text-on-surface text-lg mb-2">{name}</h3>
      <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-on-surface-variant">{lang === 'ar' ? 'فرصة' : 'Opportunities'}: </span>
          <span className="font-bold text-on-surface">{sector.opportunities}+</span>
        </div>
        <span
          className="px-2 py-1 rounded-lg text-xs font-bold"
          style={{ background: `${sector.color}15`, color: sector.color }}
        >
          {sector.growth}
        </span>
      </div>
      <div className="border-t border-outline-variant/10 pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-on-surface-variant">{t('investment.rating')}</span>
          {userRating > 0 && (
            <span className="text-xs text-gold font-medium">{userRating}/5</span>
          )}
        </div>
        <StarRating value={userRating} onChange={(v) => rateContent('investment', sector.id, v)} size="sm" />
      </div>
    </motion.div>
  );
}

function StepCard({ step, lang, isLast }) {
  const title = lang === 'ar' ? step.title_ar : step.title_en;
  const desc = lang === 'ar' ? step.desc_ar : step.desc_en;

  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div className={`absolute ${lang === 'ar' ? 'right-5' : 'left-5'} top-10 bottom-0 w-px bg-gradient-to-b from-gold/40 to-transparent`} />
      )}
      <div className="shrink-0 w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-white font-bold text-sm shadow-gold z-10">
        {step.step}
      </div>
      <div className="flex-1 pb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-card hover:shadow-majlis transition-shadow duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{step.icon}</span>
                <h3 className="font-bold text-on-surface">{title}</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
            </div>
            <a
              href={step.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gold/30 text-gold text-xs font-medium hover:bg-gold/10 transition-colors duration-200 whitespace-nowrap"
            >
              <ExternalLink className="w-3 h-3" />
              {lang === 'ar' ? 'ابدأ' : 'Start'}
            </a>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Zap className="w-3 h-3 text-gold" />
            {lang === 'ar' ? 'المدة المتوقعة:' : 'Expected duration:'} <span className="font-medium text-on-surface">{step.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const INVESTMENT_TABS = new Set(['sectors', 'steps', 'resources']);

export default function Investment() {
  const { t } = useTranslation();
  const { isRTL, language, tabResumeCount } = useApp();
  const lang = language;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    () => (INVESTMENT_TABS.has(tabFromUrl) ? tabFromUrl : 'sectors'),
  );

  useEffect(() => {
    if (INVESTMENT_TABS.has(tabFromUrl)) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  const [sectors, setSectors] = useState([]);
  const [startupSteps, setStartupSteps] = useState([]);
  const [vision2030Goals, setVision2030Goals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [secRes, stepsRes, goalsRes] = await Promise.all([
          withTimeout(supabase.from('investment_sectors').select('*').order('sort_order')),
          withTimeout(supabase.from('investment_steps').select('*').order('step')),
          withTimeout(supabase.from('vision_goals').select('*').order('sort_order')),
        ]);
        if (cancelled) return;
        if (secRes.error || stepsRes.error || goalsRes.error) {
          throw new Error(secRes.error?.message || stepsRes.error?.message || goalsRes.error?.message);
        }
        setSectors(secRes.data ?? []);
        setStartupSteps(stepsRes.data ?? []);
        setVision2030Goals(goalsRes.data ?? []);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.message || 'Failed to load');
          setSectors([]);
          setStartupSteps([]);
          setVision2030Goals([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tabResumeCount]);

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeroLight
        badge={
          <LightHeroBadge icon={TrendingUp}>
            {lang === 'ar' ? 'استثمر في المملكة' : 'Invest in KSA'}
          </LightHeroBadge>
        }
        title={t('investment.title')}
        subtitle={t('investment.subtitle')}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mt-10 md:mt-12"
        >
          {vision2030Goals.map((goal) => (
            <LightHeroStatCard
              key={goal.id}
              value={goal.value}
              label={lang === 'ar' ? goal.label_ar : goal.label_en}
            />
          ))}
        </motion.div>
      </PageHeroLight>
      <section className="bg-gradient-to-r from-saudiGreen to-saudiGreen-dark py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h3 className="text-white font-bold text-xl">{t('investment.vision2030')}</h3>
            <p className="text-white/80 text-sm">{t('investment.vision2030Desc')}</p>
          </div>
          <a
            href="https://www.vision2030.gov.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-saudiGreen font-bold text-sm hover:bg-sand transition-colors duration-200 shrink-0"
          >
            {lang === 'ar' ? 'اكتشف رؤية 2030' : 'Explore Vision 2030'}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
      <div className="sticky top-16 md:top-20 z-30 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/15 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2">
          {[
            { id: 'sectors', label: lang === 'ar' ? 'القطاعات' : 'Sectors' },
            { id: 'steps', label: lang === 'ar' ? 'خطوات البدء' : 'How to Start' },
            { id: 'resources', label: lang === 'ar' ? 'الموارد' : 'Resources' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id }, { replace: true });
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-container text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gold" />
          </div>
        )}
        {!loading && loadError && (
          <p className="text-center text-red-600 py-12 text-sm">{loadError}</p>
        )}
        {!loading && !loadError && activeTab === 'sectors' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">{t('investment.sectors')}</h2>
                <p className="text-on-surface-variant text-sm mt-1">
                  {lang === 'ar' ? 'أبرز القطاعات لفرص الاستثمار في المملكة' : 'Key sectors for investment opportunities in Saudi Arabia'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectors.map(sector => (
                <SectorCard key={sector.id} sector={sector} lang={lang} t={t} />
              ))}
            </div>
          </motion.div>
        )}
        {!loading && !loadError && activeTab === 'steps' && (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-on-surface mb-2">{t('investment.howToStart')}</h2>
                <p className="text-on-surface-variant text-sm">
                  {lang === 'ar' ? 'خمس خطوات بسيطة لبدء نشاطك التجاري في المملكة' : 'Five simple steps to start your business in Saudi Arabia'}
                </p>
              </div>
              <motion.div variants={stagger} className="space-y-1">
                {startupSteps.map((step, i) => (
                  <motion.div key={step.step} variants={fadeUp}>
                    <StepCard step={step} lang={lang} isLast={i === startupSteps.length - 1} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
        {!loading && !loadError && activeTab === 'resources' && (
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 className="text-2xl font-bold text-on-surface mb-8">
              {lang === 'ar' ? 'الموارد والروابط الرسمية' : 'Official Resources & Links'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  titleEn: 'Ministry of Investment (MISA)', titleAr: 'هيئة الاستثمار (ميسا)',
                  descEn: 'One-stop shop for investment licenses and services', descAr: 'النافذة الواحدة للتراخيص وخدمات الاستثمار',
                  url: 'https://misa.gov.sa', icon: '🏛️', color: '#006C35'
                },
                {
                  titleEn: 'Ministry of Commerce', titleAr: 'وزارة التجارة',
                  descEn: 'Business registration and commercial regulations', descAr: 'تسجيل الأعمال والأنظمة التجارية',
                  url: 'https://mc.gov.sa', icon: '📋', color: '#2563EB'
                },
                {
                  titleEn: 'Monshaat (SME Authority)', titleAr: 'منشآت',
                  descEn: 'Support for small and medium enterprises', descAr: 'دعم المشاريع الصغيرة والمتوسطة',
                  url: 'https://monshaat.gov.sa', icon: '🚀', color: '#C9A84C'
                },
                {
                  titleEn: 'ZATCA (Tax Authority)', titleAr: 'هيئة الزكاة والضريبة',
                  descEn: 'Tax registration and compliance', descAr: 'التسجيل الضريبي والامتثال',
                  url: 'https://zatca.gov.sa', icon: '💰', color: '#DC2626'
                },
                {
                  titleEn: 'NEOM', titleAr: 'نيوم',
                  descEn: 'The $500B mega-city project', descAr: 'مشروع المدينة العملاقة بقيمة 500 مليار دولار',
                  url: 'https://neom.com', icon: '🌆', color: '#7C3AED'
                },
                {
                  titleEn: 'Invest Saudi', titleAr: 'استثمر في السعودية',
                  descEn: 'Investment opportunities platform', descAr: 'منصة فرص الاستثمار',
                  url: 'https://investsaudi.sa', icon: '📈', color: '#16A34A'
                },
              ].map((r, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-container-lowest rounded-2xl p-5 flex items-start gap-4 group border border-outline-variant/10 shadow-card hover:shadow-majlis transition-all duration-300"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${r.color}15` }}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-on-surface mb-1 text-sm">
                        {lang === 'ar' ? r.titleAr : r.titleEn}
                      </h3>
                      <p className="text-on-surface-variant text-xs leading-relaxed">
                        {lang === 'ar' ? r.descAr : r.descEn}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-on-surface-variant group-hover:text-gold transition-colors shrink-0" />
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      <section className="bg-surface-container-low border-t border-outline-variant/15 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-surface-container-lowest rounded-3xl p-10 border border-outline-variant/10 shadow-card">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-on-surface mb-3">
              {lang === 'ar' ? 'هل تحتاج مساعدة للبدء؟' : 'Need Help Getting Started?'}
            </h3>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              {lang === 'ar'
                ? 'فريقنا من الخبراء جاهز لإرشادك خلال عملية الاستثمار في المملكة'
                : 'Our team of experts is ready to guide you through the investment process in Saudi Arabia'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/support" className="btn-secondary">
                {lang === 'ar' ? 'تحدث مع خبير' : 'Talk to an Expert'}
              </a>
              <a href="/" className="btn-outline">
                {lang === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI Assistant'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
