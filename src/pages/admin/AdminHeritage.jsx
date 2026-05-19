import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HERITAGE_FOCUS_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ListToolbar, { FilterSelect } from '../../components/ui/ListToolbar';
import Pagination from '../../components/ui/Pagination';
import ListState from '../../components/ui/ListState';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { heritageCategoryLabel } from '../../lib/selectOptions';

const NAV_OFFSET = 100;
const PAGE_SIZE = 9;
const CATEGORIES = ['all', 'UNESCO', 'historical', 'natural', 'cultural'];

function scrollToElement(el) {
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export default function AdminHeritage() {
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [permit, setPermit] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [focusedId, setFocusedId] = useState(null);
  const cardRefs = useRef({});
  const gridRef = useRef(null);
  const focusHandled = useRef(false);

  const filters = useMemo(
    () => ({ search, category, permit }),
    [search, category, permit],
  );

  const {
    items: sites,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
    reload,
    ensureItemVisible,
  } = usePaginatedList({
    table: 'heritage_sites',
    pageSize: PAGE_SIZE,
    order: { column: 'created_at', ascending: false },
    filters,
    searchColumns: ['name_en', 'name_ar', 'location_en', 'location_ar'],
  });

  useEffect(() => () => { focusHandled.current = false; }, []);

  const scrollToFocusedCard = useCallback((focusId) => {
    const el = cardRefs.current[focusId];
    if (el) {
      scrollToElement(el);
      return true;
    }
    if (gridRef.current) scrollToElement(gridRef.current);
    return false;
  }, []);

  useEffect(() => {
    if (loading || focusHandled.current) return;

    const focusId = location.state?.focusId || sessionStorage.getItem(HERITAGE_FOCUS_KEY);
    if (!focusId) return;

    focusHandled.current = true;
    sessionStorage.removeItem(HERITAGE_FOCUS_KEY);
    navigate(location.pathname, { replace: true, state: {} });

    ensureItemVisible(focusId).then(() => {
      setFocusedId(focusId);
      if (typeof window.history.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'manual';
      }
      let attempts = 0;
      const tryScroll = () => {
        attempts += 1;
        if (scrollToFocusedCard(focusId) || attempts >= 30) return;
        requestAnimationFrame(tryScroll);
      };
      setTimeout(() => requestAnimationFrame(tryScroll), 80);
      setTimeout(() => scrollToFocusedCard(focusId), 450);
      setTimeout(() => setFocusedId(null), 4000);
    });
  }, [loading, location.state?.focusId, location.pathname, navigate, scrollToFocusedCard, ensureItemVisible]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await supabase.from('heritage_sites').delete().eq('id', toDelete.id);
    setDeleting(false);
    setToDelete(null);
    reload();
  };

  const categoryOptions = CATEGORIES.map(cat => ({
    value: cat,
    label: cat === 'all' ? t('common.all') : heritageCategoryLabel(cat, t),
  }));

  const permitOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'yes', label: ar ? 'نعم' : 'Yes' },
    { value: 'no', label: ar ? 'لا' : 'No' },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-gold" />
            <h1 className="text-2xl font-bold text-on-surface">
              {ar ? 'إدارة مواقع التراث' : 'Manage Heritage Sites'}
            </h1>
          </div>
          <Link to="/admin/heritage/new" className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            {ar ? 'إضافة موقع' : 'Add Site'}
          </Link>
        </div>

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder={ar ? 'بحث بالاسم أو الموقع...' : 'Search name or location...'}
          ar={ar}
        >
          <FilterSelect
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            label={t('common.category')}
            ar={ar}
          />
          <FilterSelect
            value={permit}
            onChange={setPermit}
            options={permitOptions}
            label={t('common.permit')}
            ar={ar}
          />
        </ListToolbar>

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={sites.length === 0}
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[320px]"
        >
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sites.map(site => (
              <div
                key={site.id}
                ref={el => { cardRefs.current[site.id] = el; }}
                className={clsx(
                      'bg-surface-container-lowest rounded-2xl border shadow-card overflow-hidden transition-all duration-500 scroll-mt-28',
                      focusedId === site.id
                        ? 'border-gold ring-2 ring-gold/50 shadow-gold'
                        : 'border-outline-variant/10',
                    )}
                  >
                    <div className="h-36 overflow-hidden relative">
                      <img src={site.image} alt={site.name_en} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span
                        className="absolute bottom-2 left-3 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: site.color }}
                      >
                        {heritageCategoryLabel(site.category, t)}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-on-surface text-sm mb-0.5">{site.name_en}</p>
                      <p className="text-on-surface-variant text-xs mb-3">{site.name_ar}</p>
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/heritage/${site.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> {ar ? 'تعديل' : 'Edit'}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setToDelete(site)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {ar ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
              </div>
            ))}
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
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => !deleting && setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={ar ? 'حذف موقع التراث؟' : 'Delete heritage site?'}
        message={
          toDelete
            ? ar
              ? `هل أنت متأكد من حذف «${toDelete.name_ar}»؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete "${toDelete.name_en}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={ar ? 'نعم، احذف' : 'Yes, delete'}
        cancelLabel={ar ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </div>
  );
}
