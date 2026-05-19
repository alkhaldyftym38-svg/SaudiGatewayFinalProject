import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, Clock, Star, Heart, ExternalLink,
  Shield, ArrowRight, Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { withTimeout } from '../lib/queryTimeout';
import Badge from '../components/ui/Badge';
import StarRating from '../components/ui/StarRating';
import { formatNumber } from '../lib/formatLocale';
import { heritageCategoryLabel } from '../lib/selectOptions';
import { toWesternDigits } from '../lib/visitHours';

export default function HeritageDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL, language, isFavorite, toggleFavorite, getUserRating, rateContent, tabResumeCount } = useApp();
  const lang = language;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data, error } = await withTimeout(
          supabase.from('heritage_sites').select('*').eq('id', id).maybeSingle(),
        );
        if (cancelled) return;
        if (error || !data) {
          setSite(null);
          setNotFound(true);
        } else {
          setSite(data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, tabResumeCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen bg-surface pt-28 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-on-surface-variant mb-6">{t('heritage.notFound')}</p>
          <Link to="/heritage" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('heritage.backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const ar = lang === 'ar';
  const name = ar ? site.name_ar : site.name_en;
  const location = ar ? site.location_ar : site.location_en;
  const desc = ar ? site.desc_ar : site.desc_en;
  const visitHours = toWesternDigits(ar ? site.visit_hours_ar : site.visit_hours_en);
  const fav = isFavorite(site.id);
  const userRating = getUserRating('heritage', site.id);

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        <img src={site.image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute top-24 sm:top-28 left-0 right-0 px-4 sm:px-6 max-w-4xl mx-auto">
          <Link
            to="/heritage"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('heritage.backToList')}
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="gold">{heritageCategoryLabel(site.category, t)}</Badge>
            {site.permit_required && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/90 text-white">
                <Shield className="w-3 h-3" />
                {ar ? 'تصريح مطلوب' : 'Permit required'}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
              <Star className="w-3 h-3 fill-gold text-gold" />
              {site.rating ?? '—'}
              <span className="text-white/80">({formatNumber(site.reviews ?? 0, lang)})</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{name}</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: site.color }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            type="button"
            onClick={() => toggleFavorite({ id: site.id, type: 'heritage', name, image: site.image })}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              fav
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface hover:border-gold'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-red-500' : ''}`} />
            {fav ? t('heritage.removeFromFavorites') : t('heritage.addToFavorites')}
          </button>
          {site.permit_required && (
            <a
              href="https://her.gov.sa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: site.color }}
            >
              {t('heritage.getPermit')}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">{t('heritage.location')}</p>
              <p className="font-semibold text-on-surface">{location}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-on-surface-variant mb-0.5">{t('heritage.visitHours')}</p>
              <p className="font-semibold text-on-surface">{visitHours}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-on-surface mb-3">{t('heritage.about')}</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{desc}</p>
        </div>

        {site.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {site.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-on-surface">{t('heritage.rating')}</span>
            {userRating > 0 && (
              <span className="text-sm text-gold font-medium">{userRating}/5</span>
            )}
          </div>
          <StarRating value={userRating} onChange={(v) => rateContent('heritage', site.id, v)} size="lg" />
        </div>

        <Link
          to="/heritage"
          className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          {t('heritage.backToList')}
        </Link>
      </div>
    </div>
  );
}
