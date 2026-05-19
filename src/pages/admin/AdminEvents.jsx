import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EVENTS_FOCUS_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import { eventCategoryLabel, eventStatusLabel } from '../../lib/selectOptions';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ListToolbar, { FilterSelect } from '../../components/ui/ListToolbar';
import Pagination from '../../components/ui/Pagination';
import ListState from '../../components/ui/ListState';
import { usePaginatedList } from '../../hooks/usePaginatedList';

const NAV_OFFSET = 100;
const PAGE_SIZE = 10;
const STATUSES = ['all', 'ongoing', 'upcoming', 'past'];
const CATEGORIES = ['all', 'entertainment', 'cultural', 'food', 'environment', 'sports'];

const statusBadge = {
  ongoing: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  past: 'bg-gray-100 text-gray-600',
};

function scrollToElement(el) {
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export default function AdminEvents() {
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [focusedId, setFocusedId] = useState(null);
  const rowRefs = useRef({});
  const tableRef = useRef(null);
  const focusHandled = useRef(false);

  const filters = useMemo(() => ({ search, status, category }), [search, status, category]);

  const {
    items: events,
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
    table: 'events',
    pageSize: PAGE_SIZE,
    order: { column: 'date', ascending: false },
    filters,
    searchColumns: ['title_en', 'title_ar', 'location_en', 'location_ar', 'organizer'],
  });

  useEffect(() => () => { focusHandled.current = false; }, []);

  const scrollToFocusedRow = useCallback((focusId) => {
    const el = rowRefs.current[focusId];
    if (el) {
      scrollToElement(el);
      return true;
    }
    if (tableRef.current) scrollToElement(tableRef.current);
    return false;
  }, []);

  useEffect(() => {
    if (loading || focusHandled.current) return;
    const focusId = location.state?.focusId || sessionStorage.getItem(EVENTS_FOCUS_KEY);
    if (!focusId) return;

    focusHandled.current = true;
    sessionStorage.removeItem(EVENTS_FOCUS_KEY);
    navigate(location.pathname, { replace: true, state: {} });

    ensureItemVisible(focusId).then(() => {
      setFocusedId(focusId);
      if (typeof window.history.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'manual';
      }
      let attempts = 0;
      const tryScroll = () => {
        attempts += 1;
        if (scrollToFocusedRow(focusId) || attempts >= 30) return;
        requestAnimationFrame(tryScroll);
      };
      setTimeout(() => requestAnimationFrame(tryScroll), 80);
      setTimeout(() => scrollToFocusedRow(focusId), 450);
      setTimeout(() => setFocusedId(null), 4000);
    });
  }, [loading, location.state?.focusId, location.pathname, navigate, scrollToFocusedRow, ensureItemVisible]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    await supabase.from('events').delete().eq('id', toDelete.id);
    setDeleting(false);
    setToDelete(null);
    reload();
  };

  const statusOptions = STATUSES.map(s => ({
    value: s,
    label: s === 'all' ? t('common.all') : eventStatusLabel(s, t),
  }));

  const categoryOptions = CATEGORIES.map(c => ({
    value: c,
    label: c === 'all' ? t('common.all') : eventCategoryLabel(c, t),
  }));

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-on-surface">
              {ar ? 'إدارة الفعاليات' : 'Manage Events'}
            </h1>
          </div>
          <Link to="/admin/events/new" className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            {ar ? 'إضافة فعالية' : 'Add Event'}
          </Link>
        </div>

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder={ar ? 'بحث بالعنوان أو الموقع...' : 'Search title or location...'}
          ar={ar}
        >
          <FilterSelect value={status} onChange={setStatus} options={statusOptions} label={t('common.status')} ar={ar} />
          <FilterSelect value={category} onChange={setCategory} options={categoryOptions} label={t('common.category')} ar={ar} />
        </ListToolbar>

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={events.length === 0}
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[320px]"
        >
          <div
            ref={tableRef}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/15 bg-surface-container-low">
                    <th className="text-start px-5 py-3 text-on-surface-variant font-semibold">{ar ? 'العنوان' : 'Title'}</th>
                    <th className="text-start px-4 py-3 text-on-surface-variant font-semibold hidden sm:table-cell">{ar ? 'التصنيف' : 'Category'}</th>
                    <th className="text-start px-4 py-3 text-on-surface-variant font-semibold hidden md:table-cell">{ar ? 'التاريخ' : 'Date'}</th>
                    <th className="text-start px-4 py-3 text-on-surface-variant font-semibold">{ar ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr
                      key={ev.id}
                      ref={el => { rowRefs.current[ev.id] = el; }}
                      className={clsx(
                        'border-b border-outline-variant/10 transition-colors last:border-0',
                        focusedId === ev.id
                          ? 'bg-gold/10 ring-2 ring-inset ring-gold/40'
                          : 'hover:bg-surface-container',
                      )}
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-on-surface">{ev.title_en}</p>
                        <p className="text-xs text-on-surface-variant">{ev.title_ar}</p>
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">
                        {eventCategoryLabel(ev.category, t)}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">{ev.date ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[ev.status]}`}>
                          {eventStatusLabel(ev.status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Link
                            to={`/admin/events/${ev.id}/edit`}
                            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setToDelete(ev)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        title={ar ? 'حذف الفعالية؟' : 'Delete event?'}
        message={
          toDelete
            ? ar
              ? `هل أنت متأكد من حذف «${toDelete.title_ar}»؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete "${toDelete.title_en}"? This action cannot be undone.`
            : ''
        }
        confirmLabel={ar ? 'نعم، احذف' : 'Yes, delete'}
        cancelLabel={ar ? 'إلغاء' : 'Cancel'}
        variant="danger"
      />
    </div>
  );
}
