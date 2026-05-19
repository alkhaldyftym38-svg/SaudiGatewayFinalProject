import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { INVESTMENT_TAB_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';

const empty = {
  value: '',
  label_en: '',
  label_ar: '',
  sort_order: 1,
};

export default function AdminInvestmentGoalForm() {
  const { id } = useParams();
  const isEdit = Boolean(useMatch('/admin/investment/goals/:id/edit'));
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
        .from('vision_goals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr || !data) {
        setError(ar ? 'الهدف غير موجود' : 'Goal not found');
      } else {
        setForm(data);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, ar]);

  const goBack = () => {
    sessionStorage.setItem(INVESTMENT_TAB_KEY, 'goals');
    navigate('/admin/investment?tab=goals');
  };

  const handleSave = async () => {
    if (!form.value.trim() || !form.label_en.trim() || !form.label_ar.trim()) {
      setError(ar ? 'القيمة والوصفيان مطلوبان' : 'Value and both labels are required');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      value: form.value.trim(),
      label_en: form.label_en.trim(),
      label_ar: form.label_ar.trim(),
      sort_order: Number(form.sort_order) || 0,
    };
    const { error: err } = isEdit
      ? await supabase.from('vision_goals').update(payload).eq('id', id)
      : await supabase.from('vision_goals').insert(payload);
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
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
        className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
      />
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
          {isEdit ? (ar ? 'تعديل هدف' : 'Edit goal') : (ar ? 'هدف جديد' : 'New goal')}
        </h1>
        {error && (
          <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2 mb-4">{error}</p>
        )}
        <div className="space-y-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
          {field('value', ar ? 'القيمة (مثل 50%)' : 'Value (e.g. 50%)')}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('label_en', ar ? 'الوصف (إنجليزي)' : 'Label (English)')}
            {field('label_ar', ar ? 'الوصف (عربي)' : 'Label (Arabic)')}
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
