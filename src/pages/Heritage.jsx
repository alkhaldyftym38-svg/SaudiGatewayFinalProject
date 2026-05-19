import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Star, Heart, ExternalLink,
  Filter, Shield, Camera, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';
import { formatNumber } from '../lib/formatLocale';
import { heritageCategoryLabel } from '../lib/selectOptions';
import { toWesternDigits } from '../lib/visitHours';
import { usePaginatedList } from '../hooks/usePaginatedList';
import Pagination from '../components/ui/Pagination';
import ListState from '../components/ui/ListState';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function HeritageCard({ site, lang, t }) {
  const { isFavorite, toggleFavorite, getUserRating, rateContent } = useApp();
  const fav = isFavorite(site.id);
  const userRating = getUserRating('heritage', site.id);

  const handleRate = (v) => rateContent('heritage', site.id, v);

  const name = lang === 'ar' ? site.name_ar : site.name_en;
  const location = lang === 'ar' ? site.location_ar : site.location_en;
  const desc = lang === 'ar' ? site.desc_ar : site.desc_en;
  const visitHours = toWesternDigits(lang === 'ar' ? site.visit_hours_ar : site.visit_hours_en);

  return (
    <motion.div variants={fadeUp} className="card card-hover group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <Link to={`/heritage/${site.id}`} className="absolute inset-0 z-0">
          <img
            src={site.image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </Link>
        <div className="absolute top-3 left-3 z-10 flex gap-1.5 pointer-events-none">
          <Badge variant="gold">{heritageCategoryLabel(site.category, t)}</Badge>
          {site.permit_required && (
            <Badge variant="blue">
              <Shield className="w-3 h-3" />
              {lang === 'ar' ? 'تصريح مطلوب' : 'Permit'}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({ id: site.id, type: 'heritage', name, image: site.image });
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          <Star className="w-4 h-4 fill-gold text-gold" />
          <span className="text-white font-bold text-sm">{site.rating ?? '—'}</span>
          <span className="text-white/70 text-xs">({formatNumber(site.reviews ?? 0, lang)})</span>
        </div>
      </div>
      <div className="p-5">
        <Link to={`/heritage/${site.id}`}>
          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">{name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
          {location}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{desc}</p>
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4 bg-gray-50 px-3 py-2 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span>{t('heritage.visitHours')}:</span>
          <span className="font-medium text-gray-700">{visitHours}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {site.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-medium">
              {tag}
            </span>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('heritage.rating')}</span>
            {userRating > 0 && (
              <span className="text-xs text-gold font-medium">{userRating}/5</span>
            )}
          </div>
          <StarRating value={userRating} onChange={handleRate} size="md" />
        </div>
        <div className="flex gap-2 mt-4">
          <Link
            to={`/heritage/${site.id}`}
            className="flex-1 text-center py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
            style={{ background: site.color }}
          >
            {t('heritage.viewDetails')}
          </Link>
          {site.permit_required && (
            <a
              href="https://her.gov.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gold hover:text-gold transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {t('heritage.getPermit')}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ALL_CATEGORIES = ['all', 'UNESCO', 'historical', 'natural', 'cultural'];

const PAGE_SIZE = 9;

export default function Heritage() {
  const { t } = useTranslation();
  const { isRTL, language } = useApp();
  const lang = language;
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [permitOnly, setPermitOnly] = useState(false);

  const filters = useMemo(
    () => ({
      category: activeCategory,
      search,
      permit: permitOnly ? 'yes' : 'all',
    }),
    [activeCategory, search, permitOnly],
  );

  const {
    items: filtered,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
  } = usePaginatedList({
    table: 'heritage_sites',
    pageSize: PAGE_SIZE,
    order: { column: 'created_at', ascending: false },
    filters,
    searchColumns: ['name_en', 'name_ar', 'location_en', 'location_ar'],
  });

  const categoryLabels = {
    all: t('heritage.all'),
    UNESCO: heritageCategoryLabel('UNESCO', t),
    historical: heritageCategoryLabel('historical', t),
    natural: heritageCategoryLabel('natural', t),
    cultural: heritageCategoryLabel('cultural', t),
  };

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
            <LightHeroBadge icon={Camera}>
              {lang === 'ar' ? 'التراث السعودي' : 'Saudi Heritage'}
            </LightHeroBadge>
          </motion.span>
        }
        title={t('heritage.title')}
        subtitle={t('heritage.subtitle')}
      />
      <div className="sticky top-16 md:top-20 z-30 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/15 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في المواقع...' : 'Search sites...'}
            className="w-full h-10 px-4 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant shrink-0">
              <Filter className="w-4 h-4" />
              {t('heritage.filter')}:
            </span>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary-container text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPermitOnly(v => !v)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                permitOnly
                  ? 'bg-primary-container text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              {t('common.permitOnly')}
            </button>
          </div>
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-on-surface-variant text-sm">
            {formatNumber(total, lang)} {lang === 'ar' ? 'موقع' : 'sites found'}
          </p>
        </div>

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={filtered.length === 0}
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[360px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(site => (
              <HeritageCard key={site.id} site={site} lang={lang} t={t} />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            lang={lang}
          />
        </ListState>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden relative"
        >
          <img
            src="https://images.unsplash.com/photo-1586183189334-8c4d40c6cb87?w=1200&q=80"
            alt="Map"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 to-gray-950/40 flex items-center">
            <div className={`p-8 md:p-12 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {lang === 'ar' ? 'خطط زيارتك' : 'Plan Your Visit'}
              </h3>
              <p className="text-white/70 mb-6 max-w-md">
                {lang === 'ar'
                  ? 'احجز جولاتك في المواقع التراثية واحصل على التصاريح اللازمة'
                  : 'Book your heritage site tours and get the necessary permits'}
              </p>
              <a
                href="https://visitsaudi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <ExternalLink className="w-4 h-4" />
                {lang === 'ar' ? 'زيارة السعودية' : 'Visit Saudi'}
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
