import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Calendar, MapPin, Tag, ExternalLink,
  Heart, Ticket, ArrowRight, Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { withTimeout } from '../lib/queryTimeout';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { formatDate as formatAppDate } from '../lib/formatLocale';
import { eventCategoryLabel, eventStatusLabel } from '../lib/selectOptions';

const statusColors = {
  ongoing: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  upcoming: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  past: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
};

export default function EventDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL, language, isFavorite, toggleFavorite, getUserRating, rateContent, tabResumeCount } = useApp();
  const lang = language;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setEvent(null);
          setNotFound(true);
        } else {
          setEvent(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, tabResumeCount]);

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '—';
    return formatAppDate(dateStr, lang, { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-surface pt-28 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-on-surface-variant mb-6">{t('events.notFound')}</p>
          <Link to="/events" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('events.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const ar = lang === 'ar';
  const title = ar ? event.title_ar : event.title_en;
  const location = ar ? event.location_ar : event.location_en;
  const desc = ar ? event.desc_ar : event.desc_en;
  const status = statusColors[event.status] ?? statusColors.upcoming;
  const fav = isFavorite(event.id);
  const userRating = getUserRating('event', event.id);
  const dateRange = event.end_date && event.end_date !== event.date
    ? `${formatEventDate(event.date)} – ${formatEventDate(event.end_date)}`
    : formatEventDate(event.date);

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        <img src={event.image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute top-24 sm:top-28 left-0 right-0 px-4 sm:px-6 max-w-4xl mx-auto">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('events.backToList')}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text} border ${status.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${event.status === 'ongoing' ? 'animate-pulse' : ''}`} />
              {eventStatusLabel(event.status, t)}
            </span>
            <Badge variant={event.is_free ? 'free' : 'gray'}>
              <Ticket className="w-3 h-3" />
              {event.is_free ? t('events.free') : (event.price || t('events.paid'))}
            </Badge>
            {event.category && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                {eventCategoryLabel(event.category, t)}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{title}</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: event.color }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            type="button"
            onClick={() => toggleFavorite({ id: event.id, type: 'event', title, image: event.image })}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              fav
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface hover:border-gold'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-red-500' : ''}`} />
            {fav ? t('heritage.removeFromFavorites') : t('heritage.addToFavorites')}
          </button>
          {event.website && (
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: event.color }}
            >
              {event.status === 'ongoing' ? t('events.learnMore') : t('events.register')}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">{t('events.date')}</p>
              <p className="font-semibold text-on-surface">{dateRange}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">{t('events.location')}</p>
              <p className="font-semibold text-on-surface">{location}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-start gap-3 mb-8">
          <Tag className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-on-surface-variant mb-0.5">{t('events.organizer')}</p>
            <p className="font-semibold text-on-surface">{event.organizer || '—'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-3">{t('events.about')}</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{desc}</p>
        </div>

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{ background: `${event.color}15`, color: event.color }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-on-surface">{t('events.rating')}</span>
            {userRating > 0 && (
              <span className="text-sm text-gold font-medium">{userRating}/5</span>
            )}
          </div>
          <StarRating value={userRating} onChange={(v) => rateContent('event', event.id, v)} size="lg" />
        </div>

        {event.website && (
          <a
            href={event.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            {t('events.officialWebsite')}
          </a>
        )}
      </div>
    </div>
  );
}
