import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Tag, ExternalLink,
  Heart, Ticket, ArrowRight, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';
import { formatDate as formatAppDate } from '../lib/formatLocale';
import { eventCategoryLabel, eventStatusLabel } from '../lib/selectOptions';
import { usePaginatedList } from '../hooks/usePaginatedList';
import Pagination from '../components/ui/Pagination';
import ListState from '../components/ui/ListState';
import { formatNumber } from '../lib/formatLocale';

const ALL_EVENT_CATEGORIES = ['all', 'entertainment', 'cultural', 'food', 'environment', 'sports'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const statusColors = {
  ongoing: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  past: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
};

function EventCard({ event, lang, t }) {
  const { isFavorite, toggleFavorite, getUserRating, rateContent } = useApp();
  const fav = isFavorite(event.id);
  const userRating = getUserRating('event', event.id);

  const title = lang === 'ar' ? event.title_ar : event.title_en;
  const location = lang === 'ar' ? event.location_ar : event.location_en;
  const desc = lang === 'ar' ? event.desc_ar : event.desc_en;
  const status = statusColors[event.status];

  const formatEventDate = (dateStr) =>
    formatAppDate(dateStr, lang, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div variants={fadeUp} className="card card-hover group overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Link to={`/events/${event.id}`} className="absolute inset-0 z-0">
          <img
            src={event.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </Link>
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} border ${status.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${event.status === 'ongoing' ? 'animate-pulse' : ''}`} />
            {eventStatusLabel(event.status, t)}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          <Badge variant={event.isFree ? 'free' : 'gray'}>
            <Ticket className="w-3 h-3" />
            {event.isFree ? t('events.free') : t('events.paid')}
          </Badge>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite({ id: event.id, type: 'event', title, image: event.image });
            }}
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200"
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: event.color }}
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <Link to={`/events/${event.id}`}>
            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 hover:text-primary transition-colors">{title}</h3>
          </Link>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              {location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              {formatEventDate(event.date)}
            </span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{desc}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: `${event.color}15`, color: event.color }}>
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <Tag className="w-3 h-3 text-gold" />
            {event.organizer}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('events.rating')}</span>
            {userRating > 0 && (
              <span className="text-xs text-gold font-medium">{userRating}/5</span>
            )}
          </div>
          <StarRating value={userRating} onChange={(v) => rateContent('event', event.id, v)} size="md" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Link
            to={`/events/${event.id}`}
            className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ background: event.color }}
          >
            {t('events.viewDetails')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:border-gold hover:text-gold transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 9;

export default function Events() {
  const { t } = useTranslation();
  const { isRTL, language } = useApp();
  const lang = language;
  const [activeStatus, setActiveStatus] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);

  const filters = useMemo(
    () => ({
      status: activeStatus,
      category: activeCategory,
      search,
      isFree: freeOnly,
    }),
    [activeStatus, activeCategory, search, freeOnly],
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
    table: 'events',
    pageSize: PAGE_SIZE,
    order: { column: 'date', ascending: true },
    filters,
    searchColumns: ['title_en', 'title_ar', 'location_en', 'location_ar', 'organizer'],
  });

  const statusTabs = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
    { id: 'ongoing', label: t('events.ongoing') },
    { id: 'upcoming', label: t('events.upcoming') },
    { id: 'past', label: t('events.past') },
  ];

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
            <LightHeroBadge icon={Calendar}>
              {lang === 'ar' ? 'الفعاليات والمهرجانات' : 'Events & Festivals'}
            </LightHeroBadge>
          </motion.span>
        }
        title={t('events.title')}
        subtitle={t('events.subtitle')}
      />
      <div className="sticky top-16 md:top-20 z-30 bg-surface-container-low/95 backdrop-blur-md border-b border-outline-variant/15 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="py-3 border-b border-outline-variant/15">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث في الفعاليات...' : 'Search events...'}
              className="w-full h-10 px-4 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-3 border-b border-outline-variant/15">
            {statusTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeStatus === tab.id
                    ? 'bg-primary-container text-on-primary shadow-md'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-3">
            {ALL_EVENT_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : eventCategoryLabel(cat, t)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFreeOnly(v => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                freeOnly
                  ? 'bg-on-surface text-surface'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Ticket className="w-3 h-3" />
              {t('common.freeOnly')}
            </button>
          </div>
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-on-surface-variant text-sm mb-8">
          {formatNumber(total, lang)} {lang === 'ar' ? 'فعالية' : 'events found'}
        </p>

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={filtered.length === 0}
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[360px]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} lang={lang} t={t} />
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
    </div>
  );
}
