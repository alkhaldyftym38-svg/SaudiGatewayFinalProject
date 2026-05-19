import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';
import { formatDate } from '../lib/formatLocale';

const fadeUp = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function Favorites() {
  const { t } = useTranslation();
  const { favorites, toggleFavorite, savedAnswers, removeSavedAnswer, isRTL, language } = useApp();
  const lang = language;

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeroLight
        badge={
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-block"
          >
            <LightHeroBadge icon={Heart}>{t('nav.favorites')}</LightHeroBadge>
          </motion.span>
        }
        title={t('common.favorites')}
        subtitle={
          lang === 'ar'
            ? `${favorites.length} عنصر في المفضلة`
            : `${favorites.length} items saved`
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 pb-16">
        {favorites.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
          >
            <AnimatePresence>
              {favorites.map(item => (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  exit="exit"
                  layout
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card overflow-hidden group"
                >
                  {item.image && (
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.type === 'heritage' ? 'bg-gold/90 text-white' : 'bg-blue-500/90 text-white'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <Link
                      to={item.type === 'heritage' ? `/heritage/${item.id}` : `/events/${item.id}`}
                      className="block"
                    >
                      <h3 className="font-bold text-on-surface mb-3 line-clamp-1 hover:text-primary transition-colors">{item.name || item.title}</h3>
                    </Link>
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      {lang === 'ar' ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 mb-12">
            <Heart className="w-16 h-16 text-outline-variant mx-auto mb-4" />
            <h3 className="text-xl font-bold text-on-surface mb-2">
              {lang === 'ar' ? 'لا توجد عناصر في المفضلة' : 'No favorites yet'}
            </h3>
            <p className="text-on-surface-variant mb-6">
              {lang === 'ar' ? 'أضف مواقع تراثية أو فعاليات إلى مفضلتك' : 'Add heritage sites or events to your favorites'}
            </p>
            <Link to="/heritage" className="btn-primary">
              {lang === 'ar' ? 'استكشف التراث' : 'Explore Heritage'}
            </Link>
          </div>
        )}
        {savedAnswers.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span>📑</span>
              {lang === 'ar' ? 'الإجابات المحفوظة' : 'Saved Answers'}
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {savedAnswers.map(answer => (
                  <motion.div
                    key={answer.id}
                    variants={fadeUp}
                    exit="exit"
                    layout
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card p-5"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-on-surface mb-1 text-sm">{answer.question}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDate(answer.savedAt, lang)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeSavedAnswer(answer.id)}
                        className="text-on-surface-variant hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-on-surface-variant text-sm line-clamp-3 leading-relaxed">{answer.answer}</p>
                    {answer.links && answer.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {answer.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
                          >
                            {link.label} <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
