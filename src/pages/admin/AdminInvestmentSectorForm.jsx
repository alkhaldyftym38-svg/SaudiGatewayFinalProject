import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { INVESTMENT_TAB_KEY } from '../../lib/adminFocus';
import { sectorIconOptions } from '../../lib/investmentIcons';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';

const empty = {
  id: '',
  icon: '💼',
  name_en: '',
  name_ar: '',
  desc_en: '',
  desc_ar: '',
  color: '#C9A84C',
  opportunities: 0,
  growth: '+0%',
  sort_order: 1,
};

export default function AdminInvestmentSectorForm() {
  const { id } = useParams();
  const isEdit = Boolean(useMatch('/admin/investment/sectors/:id/edit'));
  const navigate = useNavigate();
  const { language } = useApp();
  const ar = language === 'ar';

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('investment_sectors')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr || !data) {
        setError(ar ? 'القطاع غير موجود' : 'Sector not found');
      } else {
        setForm(data);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, ar]);

  const goBack = () => {
    sessionStorage.setItem(INVESTMENT_TAB_KEY, 'sectors');
    navigate('/admin/investment?tab=sectors');
  };

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      setError(ar ? 'الاسمان مطلوبان' : 'Both names are required');
      return;
    }
    const sectorId = (isEdit ? id : form.id).trim();
    if (!sectorId) {
      setError(ar ? 'المعرّف مطلوب (مثل s7)' : 'ID is required (e.g. s7)');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      id: sectorId,
      icon: form.icon?.trim() || '💼',
      name_en: form.name_en.trim(),
      name_ar: form.name_ar.trim(),
      desc_en: form.desc_en?.trim() ?? '',
      desc_ar: form.desc_ar?.trim() ?? '',
      color: form.color?.trim() || '#C9A84C',
      opportunities: Number(form.opportunities) || 0,
      growth: form.growth?.trim() || '+0%',
      sort_order: Number(form.sort_order) || 0,
    };
    const { error: err } = isEdit
      ? await supabase.from('investment_sectors').update(payload).eq('id', id)
      : await supabase.from('investment_sectors').insert(payload);
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    goBack();
  };

  const field = (key, label, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={form[key] ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key] ?? ''}
          disabled={key === 'id' && isEdit}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none disabled:opacity-60"
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-sm text-on-surface-variant mb-6 hover:text-primary">
          <ArrowLeft className="w-4 h-4" />
          {ar ? 'العودة' : 'Back'}
        </button>
        <h1 className="text-2xl font-bold text-on-surface mb-6">
          {isEdit ? (ar ? 'تعديل قطاع' : 'Edit sector') : (ar ? 'قطاع جديد' : 'New sector')}
        </h1>
        {error && (
          <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2 mb-4">{error}</p>
        )}
        <div className="space-y-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
          {!isEdit && field('id', ar ? 'المعرّف (فريد)' : 'ID (unique)')}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('name_en', ar ? 'الاسم (إنجليزي)' : 'Name (English)')}
            {field('name_ar', ar ? 'الاسم (عربي)' : 'Name (Arabic)')}
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              {ar ? 'أيقونة' : 'Icon'}
            </label>
            <div className="flex items-center gap-3">
              <select
                value={form.icon ?? '💼'}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                className="flex-1 rounded-xl border border-outline-variant/30 bg-surface px-3 py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
              >
                {sectorIconOptions(form.icon).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value} — {ar ? opt.labelAr : opt.labelEn}
                  </option>
                ))}
              </select>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container text-2xl"
                aria-hidden
              >
                {form.icon || '💼'}
              </span>
            </div>
          </div>
          {field('desc_en', ar ? 'الوصف (إنجليزي)' : 'Description (English)', 'textarea')}
          {field('desc_ar', ar ? 'الوصف (عربي)' : 'Description (Arabic)', 'textarea')}
          <div className="grid sm:grid-cols-3 gap-4">
            {field('color', ar ? 'اللون' : 'Color')}
            {field('opportunities', ar ? 'الفرص' : 'Opportunities', 'number')}
            {field('growth', ar ? 'النمو' : 'Growth')}
          </div>
          {field('sort_order', ar ? 'ترتيب العرض' : 'Sort order', 'number')}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-6 gap-2 justify-center"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {ar ? 'حفظ' : 'Save'}
        </button>
      </div>
    </div>
  );
}
