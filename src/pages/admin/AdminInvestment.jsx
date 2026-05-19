import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, TrendingUp, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { INVESTMENT_TAB_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ListToolbar from '../../components/ui/ListToolbar';
import ListState from '../../components/ui/ListState';

const TABS = ['sectors', 'steps', 'goals'];

export default function AdminInvestment() {
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'sectors';

  const [sectors, setSectors] = useState([]);
  const [steps, setSteps] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const setTab = (next) => {
    setSearch('');
    setSearchParams({ tab: next });
  };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setFetching(true);
    const [sec, st, go] = await Promise.all([
      supabase.from('investment_sectors').select('*').order('sort_order'),
      supabase.from('investment_steps').select('*').order('step'),
      supabase.from('vision_goals').select('*').order('sort_order'),
    ]);
    if (sec.data) setSectors(sec.data);
    if (st.data) setSteps(st.data);
    if (go.data) setGoals(go.data);
    setLoading(false);
    setFetching(false);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(INVESTMENT_TAB_KEY);
    if (stored && TABS.includes(stored)) {
      setSearchParams({ tab: stored }, { replace: true });
      sessionStorage.removeItem(INVESTMENT_TAB_KEY);
    }
  }, [setSearchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const term = search.trim().toLowerCase();

  const filteredSectors = useMemo(() => {
    if (!term) return sectors;
    return sectors.filter((s) =>
      [s.id, s.name_en, s.name_ar, s.desc_en, s.desc_ar].some((v) => String(v ?? '').toLowerCase().includes(term)),
    );
  }, [sectors, term]);

  const filteredSteps = useMemo(() => {
    if (!term) return steps;
    return steps.filter((s) =>
      [s.step, s.title_en, s.title_ar, s.link].some((v) => String(v ?? '').toLowerCase().includes(term)),
    );
  }, [steps, term]);

  const filteredGoals = useMemo(() => {
    if (!term) return goals;
    return goals.filter((g) =>
      [g.value, g.label_en, g.label_ar].some((v) => String(v ?? '').toLowerCase().includes(term)),
    );
  }, [goals, term]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const { table, key, value } = toDelete;
    await supabase.from(table).delete().eq(key, value);
    setDeleting(false);
    setToDelete(null);
    load(true);
  };

  const tabLabels = {
    sectors: ar ? 'القطاعات' : 'Sectors',
    steps: ar ? 'خطوات البدء' : 'Startup steps',
    goals: ar ? 'أهداف رؤية 2030' : 'Vision 2030 goals',
  };

  const newPath = tab === 'sectors'
    ? '/admin/investment/sectors/new'
    : tab === 'steps'
      ? '/admin/investment/steps/new'
      : '/admin/investment/goals/new';

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {ar ? 'إدارة الاستثمار' : 'Manage investment'}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {ar ? 'القطاعات والخطوات وأهداف الرؤية' : 'Sectors, steps, and vision goals'}
              </p>
            </div>
          </div>
          <Link to={newPath} className="btn-primary gap-2">
            <Plus className="w-4 h-4" />
            {ar ? 'إضافة' : 'Add'}
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-primary-container text-on-primary shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tabLabels[id]}
            </button>
          ))}
        </div>

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder={ar ? 'بحث...' : 'Search...'}
          ar={ar}
        />

        <ListState
          loading={loading}
          fetching={fetching}
          isEmpty={
            (tab === 'sectors' && filteredSectors.length === 0)
            || (tab === 'steps' && filteredSteps.length === 0)
            || (tab === 'goals' && filteredGoals.length === 0)
          }
          emptyMessage={t('common.noResults')}
          minHeight="min-h-[240px]"
        >
          {tab === 'sectors' && (
            <div className="space-y-3">
              {filteredSectors.map((row) => (
                <div
                  key={row.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 sm:p-5 flex flex-wrap gap-4 items-start justify-between"
                >
                  <div className="flex gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{row.icon}</span>
                    <div>
                      <p className="font-bold text-on-surface">
                        {ar ? row.name_ar : row.name_en}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">ID: {row.id}</p>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">
                        {ar ? row.desc_ar : row.desc_en}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2">
                        {row.opportunities}+ · {row.growth} · #{row.sort_order}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/admin/investment/sectors/${row.id}/edit`}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete({ table: 'investment_sectors', key: 'id', value: row.id })}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'steps' && (
            <div className="space-y-3">
              {filteredSteps.map((row) => (
                <div
                  key={row.step}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 sm:p-5 flex flex-wrap gap-4 items-start justify-between"
                >
                  <div className="flex gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-gold-gradient text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {row.step}
                    </span>
                    <div>
                      <p className="font-bold text-on-surface">
                        {ar ? row.title_ar : row.title_en}
                      </p>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">
                        {ar ? row.desc_ar : row.desc_en}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-on-surface-variant">
                        <span>{row.duration}</span>
                        {row.link && row.link !== '#' && (
                          <a
                            href={row.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {ar ? 'الرابط' : 'Link'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/admin/investment/steps/${row.step}/edit`}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete({ table: 'investment_steps', key: 'step', value: row.step })}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'goals' && (
            <div className="space-y-3">
              {filteredGoals.map((row) => (
                <div
                  key={row.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-4 sm:p-5 flex flex-wrap gap-4 items-center justify-between"
                >
                  <div>
                    <p className="text-2xl font-black text-primary">{row.value}</p>
                    <p className="text-sm text-on-surface-variant">
                      {ar ? row.label_ar : row.label_en}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">#{row.sort_order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      to={`/admin/investment/goals/${row.id}/edit`}
                      className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete({ table: 'vision_goals', key: 'id', value: row.id })}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListState>

        <ConfirmDialog
          open={Boolean(toDelete)}
          onClose={() => !deleting && setToDelete(null)}
          onConfirm={confirmDelete}
          loading={deleting}
          title={ar ? 'حذف هذا العنصر؟' : 'Delete this item?'}
          message={ar ? 'لا يمكن التراجع.' : 'This cannot be undone.'}
          confirmLabel={ar ? 'نعم' : 'Yes'}
          cancelLabel={ar ? 'إلغاء' : 'Cancel'}
          variant="danger"
        />
      </div>
    </div>
  );
}
