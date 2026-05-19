import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../lib/formatLocale';
import ListToolbar, { FilterSelect } from '../../components/ui/ListToolbar';
import Pagination from '../../components/ui/Pagination';
import ListState from '../../components/ui/ListState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StarRating from '../../components/ui/StarRating';
import { useAdminRatings } from '../../hooks/useAdminRatings';
import { adminEditPath, publicPathForType, RATING_TYPES } from '../../lib/contentRatings';

const PAGE_SIZE = 10;

const TYPE_LABELS = {
  heritage: { ar: 'تراث', en: 'Heritage' },
  event: { ar: 'فعالية', en: 'Event' },
  investment: { ar: 'استثمار', en: 'Investment' },
};

export default function AdminRatings() {
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';
  const [search, setSearch] = useState('');
  const [stars, setStars] = useState('all');
  const [category, setCategory] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [acting, setActing] = useState(false);
  const [stats, setStats] = useState({ count: 0, average: 0 });

  const {
    items,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
    error,
    reload,
  } = useAdminRatings({ pageSize: PAGE_SIZE, search, stars, category });

  const starOptions = [
    { value: 'all', label: t('common.all') },
    { value: '5', label: ar ? '5 نجوم' : '5 stars' },
    { value: '4', label: ar ? '4 نجوم' : '4 stars' },
    { value: '3', label: ar ? '3 نجوم' : '3 stars' },
    { value: '2', label: ar ? '2 نجوم' : '2 stars' },
    { value: '1', label: ar ? '1 نجمة' : '1 star' },
  ];

  const categoryOptions = [
    { value: 'all', label: t('common.all') },
    ...RATING_TYPES.map((type) => ({
      value: type,
      label: ar ? TYPE_LABELS[type].ar : TYPE_LABELS[type].en,
    })),
  ];

  const loadStats = async () => {
    const { data } = await supabase.from('content_ratings').select('rating');
    if (!data?.length) {
      setStats({ count: 0, average: 0 });
      return;
    }
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    setStats({ count: data.length, average: sum / data.length });
  };

  useEffect(() => {
    loadStats();
  }, [total]);

  const deleteRating = async () => {
    if (!confirm) return;
    setActing(true);
    const { error: err } = await supabase.from('content_ratings').delete().eq('id', confirm.id);
    setActing(false);
    setConfirm(null);
    if (!err) {
      reload();
      loadStats();
    }
  };

  const fmt = (d) => d
    ? formatDate(d, ar ? 'ar' : 'en', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const itemTitle = (row) => {
    const item = row.item;
    if (!item) return row.item_id;
    if (row.item_type === 'heritage') {
      return ar ? (item.name_ar || item.name_en) : (item.name_en || item.name_ar);
    }
    if (row.item_type === 'event') {
      return ar ? (item.title_ar || item.title_en) : (item.title_en || item.title_ar);
    }
    return ar ? (item.name_ar || item.name_en) : (item.name_en || item.name_ar);
  };

  const itemImage = (row) => {
    if (row.item_type === 'investment') return null;
    return row.item?.image ?? null;
  };

  const typeLabel = (type) => (ar ? TYPE_LABELS[type]?.ar : TYPE_LABELS[type]?.en) ?? type;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {ar ? 'التقييمات' : 'Ratings'}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {ar
                ? 'تقييمات مجهولة للتراث والفعاليات والاستثمار (بدون هوية المقيّم)'
                : 'Anonymous ratings for heritage, events, and investment (rater hidden)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 shadow-card">
            <p className="text-xs text-on-surface-variant mb-1">{ar ? 'إجمالي التقييمات' : 'Total ratings'}</p>
            <p className="text-2xl font-black text-on-surface">{stats.count}</p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 shadow-card col-span-1 sm:col-span-2">
            <p className="text-xs text-on-surface-variant mb-1">{ar ? 'المتوسط العام' : 'Average score'}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-on-surface">{stats.average ? stats.average.toFixed(1) : '—'}</p>
              <Star className="w-5 h-5 fill-gold text-gold" />
            </div>
          </div>
        </div>

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder={ar ? 'بحث بالاسم أو رقم النجوم (1-5)...' : 'Search name or stars (1-5)...'}
          ar={ar}
        >
          <FilterSelect
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            label={ar ? 'الفئة' : 'Category'}
            ar={ar}
          />
          <FilterSelect
            value={stars}
            onChange={setStars}
            options={starOptions}
            label={ar ? 'النجوم' : 'Stars'}
            ar={ar}
          />
        </ListToolbar>

        {error && (
          <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2 mb-4" role="alert">
            {error}
          </p>
        )}

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={!error && items.length === 0}
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[280px]"
        >
          <div className="space-y-3">
            {items.map((row) => {
              const editPath = adminEditPath(row.item_type, row.item_id);
              const publicPath = publicPathForType(row.item_type, row.item_id);
              const image = itemImage(row);

              return (
                <div
                  key={row.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                >
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className="w-full sm:w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                  )}
                  {row.item_type === 'investment' && row.item?.icon && (
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${row.item.color ?? '#C9A84C'}15` }}
                    >
                      {row.item.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-700 mb-1">
                          {typeLabel(row.item_type)}
                        </span>
                        {editPath ? (
                          <Link
                            to={editPath}
                            className="font-bold text-on-surface hover:text-primary inline-flex items-center gap-1 block"
                          >
                            {itemTitle(row)}
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                          </Link>
                        ) : (
                          <p className="font-bold text-on-surface">{itemTitle(row)}</p>
                        )}
                      </div>
                      <StarRating value={row.rating} readonly size="sm" />
                    </div>
                    <p className="text-xs text-on-surface-variant mb-2 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fmt(row.created_at)}
                    </p>
                    <Link to={publicPath} className="text-xs font-semibold text-primary hover:underline">
                      {ar ? 'عرض في الموقع العام' : 'View on public site'}
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirm(row)}
                    className="self-start p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title={ar ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            lang={language}
          />
        </ListState>

        <ConfirmDialog
          open={Boolean(confirm)}
          onClose={() => !acting && setConfirm(null)}
          onConfirm={deleteRating}
          loading={acting}
          title={ar ? 'حذف هذا التقييم؟' : 'Delete this rating?'}
          message={ar
            ? 'سيُزال من قاعدة البيانات. لا يمكن التراجع.'
            : 'It will be removed from the database. This cannot be undone.'}
          confirmLabel={ar ? 'نعم' : 'Yes'}
          cancelLabel={ar ? 'إلغاء' : 'Cancel'}
          variant="danger"
        />
      </div>
    </div>
  );
}
