import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { INVESTMENT_TAB_KEY } from '../../lib/adminFocus';
import { isValidOutboundLink, normalizeOutboundLink } from '../../lib/investmentAdmin';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';

const empty = {
  step: '',
  title_en: '',
  title_ar: '',
  desc_en: '',
  desc_ar: '',
  link: '#',
  icon: '📋',
  duration: '',
};

export default function AdminInvestmentStepForm() {
  const { step: stepParam } = useParams();
  const isEdit = Boolean(useMatch('/admin/investment/steps/:step/edit'));
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
      const stepNum = Number(stepParam);
      const { data, error: fetchErr } = await supabase
        .from('investment_steps')
        .select('*')
        .eq('step', stepNum)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr || !data) {
        setError(ar ? 'الخطوة غير موجودة' : 'Step not found');
      } else {
        setForm({ ...data, step: String(data.step) });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [stepParam, isEdit, ar]);

  const goBack = () => {
    sessionStorage.setItem(INVESTMENT_TAB_KEY, 'steps');
    navigate('/admin/investment?tab=steps');
  };

  const handleSave = async () => {
    if (!form.title_en.trim() || !form.title_ar.trim()) {
      setError(ar ? 'العنوانان مطلوبان' : 'Both titles are required');
      return;
    }
    const stepNum = Number(isEdit ? stepParam : form.step);
    if (!Number.isInteger(stepNum) || stepNum < 1) {
      setError(ar ? 'رقم الخطوة غير صالح' : 'Invalid step number');
      return;
    }
    if (!isValidOutboundLink(form.link)) {
      setError(ar ? 'الرابط غير صالح' : 'Invalid link URL');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      step: stepNum,
      title_en: form.title_en.trim(),
      title_ar: form.title_ar.trim(),
      desc_en: form.desc_en?.trim() ?? '',
      desc_ar: form.desc_ar?.trim() ?? '',
      link: normalizeOutboundLink(form.link),
      icon: form.icon?.trim() || '📋',
      duration: form.duration?.trim() ?? '',
    };
    const { error: err } = isEdit
      ? await supabase.from('investment_steps').update(payload).eq('step', stepNum)
      : await supabase.from('investment_steps').insert(payload);
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
          disabled={key === 'step' && isEdit}
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
          {isEdit ? (ar ? 'تعديل خطوة' : 'Edit step') : (ar ? 'خطوة جديدة' : 'New step')}
        </h1>
        {error && (
          <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2 mb-4">{error}</p>
        )}
        <div className="space-y-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-6">
          {!isEdit && field('step', ar ? 'رقم الخطوة' : 'Step number', 'number')}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('title_en', ar ? 'العنوان (إنجليزي)' : 'Title (English)')}
            {field('title_ar', ar ? 'العنوان (عربي)' : 'Title (Arabic)')}
          </div>
          {field('desc_en', ar ? 'الوصف (إنجليزي)' : 'Description (English)', 'textarea')}
          {field('desc_ar', ar ? 'الوصف (عربي)' : 'Description (Arabic)', 'textarea')}
          {field('link', ar ? 'الرابط (# إن لم يوجد)' : 'Link (# if none)')}
          {field('icon', ar ? 'أيقونة' : 'Icon')}
          {field('duration', ar ? 'المدة' : 'Duration')}
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
