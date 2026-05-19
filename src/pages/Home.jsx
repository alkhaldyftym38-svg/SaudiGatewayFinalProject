import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bolt, ArrowRight, ArrowLeft, PlayCircle, Landmark, CalendarDays, Banknote,
  Calendar, ChevronRight, Sparkles,
} from 'lucide-react';
import AIAssistant from '../components/ai/AIAssistant';
import { useApp } from '../context/AppContext';
import { fetchHomeImages, resolveHomeImages } from '../lib/homeImages';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const { t } = useTranslation();
  const { isRTL, language, tabResumeCount } = useApp();
  const [img, setImg] = useState(() => resolveHomeImages({}));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchHomeImages();
      if (!cancelled) setImg(next);
    })();
    return () => { cancelled = true; };
  }, [tabResumeCount]);
  const s = (k) => t(`stitch.${k}`);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = ChevronRight;

  const stats = [
    { value: '500+', label: t('stats.sites') },
    { value: '1,000+', label: s('statEvents') },
    { value: '$50B+', label: s('statTourism') },
    { value: '13', label: s('statProvinces') },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-x-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <aside
        className={`hidden lg:flex fixed top-20 z-40 w-80 h-[calc(100dvh-5rem)] flex-col p-6 bg-surface-container-lowest dark:bg-on-surface rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden ${
          isRTL ? 'left-0 rounded-r-3xl rounded-l-none border-r border-l-0' : 'right-0 rounded-l-3xl rounded-r-none'
        }`}
      >
        <AIAssistant variant="stitch" />
      </aside>

      <main
        className={`pt-24 pb-16 px-4 sm:px-8 lg:px-12 ${
          isRTL ? 'lg:ml-80 lg:mr-0' : 'lg:mr-80'
        }`}
      >
        <section className="relative py-8 lg:py-16 overflow-hidden">
          <div
            className={`absolute top-0 w-1/2 h-full opacity-[0.06] islamic-pattern-dots text-primary pointer-events-none ${
              isRTL ? 'left-0' : 'right-0'
            }`}
          />
          <div className="max-w-4xl relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-6"
              >
                <Bolt className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wide uppercase">{s('badge')}</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="font-headline text-4xl sm:text-5xl xl:text-7xl font-black text-on-surface leading-[1.1] tracking-tight mb-6"
              >
                {s('headlineA')}{' '}
                <span className="text-primary italic">{s('headlineB')}</span>{' '}
                {language === 'ar' ? '' : <br className="hidden sm:block" />}
                {s('headlineC')}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg sm:text-xl text-on-surface-variant max-w-2xl leading-relaxed mb-8"
              >
                {s('sub')}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 items-center">
                <a
                  href="#ai-assistant"
                  className="gold-gradient text-on-secondary-fixed px-6 sm:px-8 py-3 sm:py-4 rounded-full font-extrabold text-base sm:text-lg shadow-xl flex items-center gap-3 hover:brightness-105 transition-all group"
                >
                  {s('startJourney')}
                  <Arrow className="w-5 h-5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </a>
                <button
                  type="button"
                  className="flex items-center gap-2 text-on-surface-variant font-semibold text-sm hover:text-primary transition-colors"
                >
                  <PlayCircle className="w-6 h-6 text-primary" />
                  {s('watchVision')}
                </button>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-12">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                  {s('popular')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/heritage"
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 sm:px-5 py-3 rounded-2xl hover:bg-surface-container transition-all text-sm font-medium flex items-center gap-2 shadow-card"
                  >
                    <Landmark className="w-5 h-5 text-primary shrink-0" />
                    {s('chipHeritage')}
                  </Link>
                  <Link
                    to="/events"
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 sm:px-5 py-3 rounded-2xl hover:bg-surface-container transition-all text-sm font-medium flex items-center gap-2 shadow-card"
                  >
                    <CalendarDays className="w-5 h-5 text-primary shrink-0" />
                    {s('chipEvents')}
                  </Link>
                  <Link
                    to="/investment"
                    className="bg-surface-container-lowest border border-outline-variant/20 px-4 sm:px-5 py-3 rounded-2xl hover:bg-surface-container transition-all text-sm font-medium flex items-center gap-2 shadow-card"
                  >
                    <Banknote className="w-5 h-5 text-primary shrink-0" />
                    {s('chipInvest')}
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
          {img.heroSide ? (
            <div
              className={`absolute top-[10%] w-[42%] h-[75%] rounded-3xl overflow-hidden shadow-2xl rotate-3 hidden xl:block ${
                isRTL ? 'left-[-4%]' : 'right-[-4%]'
              }`}
            >
              <img
                src={img.heroSide}
                alt={language === 'ar' ? 'العُلا والتراث السعودي' : 'Al-Ula and Saudi heritage'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
          ) : null}
        </section>
        <section id="ai-assistant" className="lg:hidden mb-12">
          <div className="flex justify-end mb-2">
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              {s('openAssistantFullscreen')}
            </Link>
          </div>
          <AIAssistant variant="stitch" compact />
        </section>
        <section className="py-10 sm:py-12 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 bg-surface-container-low">
          <div className="max-w-screen-xl mx-auto flex flex-wrap justify-around gap-6 sm:gap-4">
            {stats.map((row, i) => (
              <div key={row.label} className="flex items-center gap-4 sm:gap-8">
                {i > 0 && (
                  <div className="hidden sm:block h-12 w-px bg-outline-variant/25 self-stretch" />
                )}
                <div className="text-center min-w-[100px]">
                  <div className="text-3xl sm:text-4xl font-black text-primary mb-1">{row.value}</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {row.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(280px,auto)]">
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl overflow-hidden relative group shadow-card min-h-[320px]">
              <img
                src={img.heritage}
                alt={language === 'ar' ? 'واحة الأحساء' : 'Al-Ahsa Oasis'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/25 to-transparent p-8 sm:p-12 flex flex-col justify-end">
                <div className="max-w-md">
                  <span className="text-tertiary-fixed font-bold text-sm tracking-widest uppercase mb-3 block">
                    {s('legacy')}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">{s('bentoHeritageTitle')}</h2>
                  <p className="text-white/80 mb-6 text-sm leading-relaxed">{s('bentoHeritageDesc')}</p>
                  <Link
                    to="/heritage"
                    className="inline-flex bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-white/20 transition-all"
                  >
                    {s('exploreSites')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-primary-container rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-card min-h-[280px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-on-primary" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-on-primary mb-3">{s('bentoEventsTitle')}</h3>
                <p className="text-on-primary/80 mb-6 text-sm leading-relaxed">{s('bentoEventsDesc')}</p>
                <Link
                  to="/events"
                  className="text-tertiary-fixed font-bold flex items-center gap-2 group"
                >
                  {s('viewCalendar')}
                  <Chevron className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-surface-container rounded-3xl p-8 sm:p-10 flex flex-col shadow-card relative overflow-hidden min-h-[280px]">
              <div className="absolute -right-8 -top-8 w-48 h-48 islamic-pattern-stitch opacity-40 pointer-events-none" />
              <div className="mt-auto relative z-10">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-on-surface mb-2">{s('bentoInvestTitle')}</h3>
                <p className="text-on-surface-variant text-sm mb-5 leading-relaxed">{s('bentoInvestDesc')}</p>
                <Link to="/investment" className="text-primary font-bold text-sm hover:underline underline-offset-4">
                  {t('investment.learnMore')}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 bg-surface-container-highest rounded-3xl overflow-hidden relative group shadow-card min-h-[300px]">
              <img
                src={img.riyadh}
                alt={language === 'ar' ? 'الرياض' : 'Riyadh skyline'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/45 p-8 sm:p-12 flex flex-col justify-end">
                <div className="max-w-md">
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{s('bentoModernTitle')}</h2>
                  <p className="text-white/85 text-sm">{s('bentoModernDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 lg:py-20 text-center">
          <div className="max-w-4xl mx-auto bg-surface-container-low rounded-[2.5rem] sm:rounded-[3rem] p-10 sm:p-16 border border-outline-variant/15 relative overflow-hidden shadow-majlis">
            <div className="absolute inset-0 islamic-pattern-stitch opacity-[0.07] pointer-events-none" />
            <h2 className="text-3xl sm:text-5xl font-black text-on-surface mb-4 relative z-10">{s('ctaTitle')}</h2>
            <p className="text-lg sm:text-xl text-on-surface-variant mb-10 relative z-10 max-w-xl mx-auto">
              {s('ctaSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <a
                href="#ai-assistant"
                className="gold-gradient text-on-secondary-fixed px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all lg:hidden"
              >
                {s('startJourney')}
              </a>
              <Link
                to="/support"
                className="bg-primary-container text-on-primary px-8 sm:px-12 py-4 sm:py-5 rounded-full font-black text-lg hover:bg-primary transition-all"
              >
                {s('registerInterest')}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
