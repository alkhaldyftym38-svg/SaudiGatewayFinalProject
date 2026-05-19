import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react';
import { HERITAGE_FOCUS_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import ImageUploader from '../../components/ui/ImageUploader';
import VisitHoursPicker from '../../components/ui/VisitHoursPicker';
import TagsInput from '../../components/ui/TagsInput';
import { heritageCategoryLabel } from '../../lib/selectOptions';

const exampleSite = {
  name_en: 'Example Heritage Site',
  name_ar: 'موقع تراثي تجريبي',
  category: 'cultural',
  location_en: 'Riyadh Region',
  location_ar: 'منطقة الرياض',
  desc_en: 'A sample heritage site for testing. You can save as-is or edit any field.',
  desc_ar: 'موقع تراثي تجريبي للاختبار. يمكنك الحفظ مباشرة أو تعديل أي حقل.',
  image: 'https://images.unsplash.com/photo-1586183189334-8c4d40c6cb87?w=600&q=80',
  visit_hours_en: '9:00 AM - 6:00 PM',
  visit_hours_ar: '9:00 ص - 6:00 م',
  permit_required: false,
  tags: ['cultural', 'heritage', 'sample'],
  color: '#C9A84C',
};

const categories = ['UNESCO', 'historical', 'natural', 'cultural'];

export default function AdminHeritageForm() {
  const { id } = useParams();
  const isEdit = Boolean(useMatch('/admin/heritage/:id/edit'));
  const navigate = useNavigate();
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';

  const [form, setForm] = useState(isEdit ? { ...exampleSite, name_en: '', name_ar: '' } : exampleSite);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('heritage_sites')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr || !data) {
        setError(ar ? 'الموقع غير موجود' : 'Site not found');
        setLoading(false);
        return;
      }
      setForm({ ...data, tags: data.tags ?? [] });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, ar]);

  const handleSave = async () => {
    if (!form.name_en.trim() || !form.name_ar.trim()) {
      setError(ar ? 'الاسمان مطلوبان' : 'Both names are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { id: _id, created_at, rating, reviews, ...fields } = form;
      const payload = {
        ...fields,
        tags: Array.isArray(form.tags) ? form.tags : [],
        permit_required: Boolean(form.permit_required),
      };
      const { data: saved, error: err } = isEdit
        ? await supabase.from('heritage_sites').update(payload).eq('id', id).select('id').single()
        : await supabase.from('heritage_sites').insert(payload).select('id').single();
      setSaving(false);
      if (err) {
        setError(err.message);
        return;
      }
      const focusId = saved?.id ?? id;
      if (focusId) sessionStorage.setItem(HERITAGE_FOCUS_KEY, focusId);
      navigate('/admin/heritage', { state: { focusId } });
    } catch (e) {
      setSaving(false);
      setError(e.message ?? (ar ? 'فشل الحفظ' : 'Save failed'));
    }
  };

  const field = (key, label, type = 'text', opts = {}) => (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          rows={3}
          value={form[key] ?? ''}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none resize-none"
          {...opts}
        />
      ) : type === 'checkbox' ? (
        <input
          type="checkbox"
          checked={Boolean(form[key])}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
          className="w-4 h-4 accent-primary"
        />
      ) : type === 'select' ? (
        <select
          value={form[key] ?? ''}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
        >
          {opts.options?.map(o => (
            <option key={o} value={o}>
              {opts.optionLabel ? opts.optionLabel(o) : o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={form[key] ?? ''}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          className="w-full rounded-xl border border-outline-variant/30 bg-surface px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary/40 outline-none"
          {...opts}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin/heritage"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {ar ? 'العودة إلى القائمة' : 'Back to list'}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-6 h-6 text-gold" />
          <h1 className="text-2xl font-bold text-on-surface">
            {isEdit
              ? (ar ? 'تعديل موقع تراثي' : 'Edit Heritage Site')
              : (ar ? 'إضافة موقع تراثي' : 'Add Heritage Site')}
          </h1>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card p-6 sm:p-8">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-6">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('category', ar ? 'التصنيف' : 'Category', 'select', {
              options: categories,
              optionLabel: v => heritageCategoryLabel(v, t),
            })}
            {field('name_en', ar ? 'الاسم (EN)' : 'Name (EN)')}
            {field('name_ar', ar ? 'الاسم (AR)' : 'Name (AR)')}
            {field('location_en', ar ? 'الموقع (EN)' : 'Location (EN)')}
            {field('location_ar', ar ? 'الموقع (AR)' : 'Location (AR)')}
            <div className="sm:col-span-2">{field('desc_en', ar ? 'الوصف (EN)' : 'Description (EN)', 'textarea')}</div>
            <div className="sm:col-span-2">{field('desc_ar', ar ? 'الوصف (AR)' : 'Description (AR)', 'textarea')}</div>
            <div className="sm:col-span-2">
              <ImageUploader
                value={form.image ?? ''}
                onChange={url => setForm(p => ({ ...p, image: url }))}
                label={ar ? 'الصورة' : 'Image'}
                ar={ar}
              />
            </div>
            <VisitHoursPicker
              valueEn={form.visit_hours_en ?? ''}
              valueAr={form.visit_hours_ar ?? ''}
              onChange={({ en, ar: hoursAr }) =>
                setForm(p => ({ ...p, visit_hours_en: en, visit_hours_ar: hoursAr }))
              }
              ar={ar}
            />
            {field('color', ar ? 'اللون' : 'Color', 'color')}
            <TagsInput
              label={ar ? 'التاقات' : 'Tags'}
              value={form.tags}
              onChange={tags => setForm(p => ({ ...p, tags }))}
              ar={ar}
            />
            <label className="flex items-center gap-3 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(form.permit_required)}
                onChange={e => setForm(p => ({ ...p, permit_required: e.target.checked }))}
                className="w-4 h-4 accent-primary shrink-0"
              />
              <span className="text-sm font-semibold text-on-surface">
                {ar ? 'يتطلب تصريح' : 'Permit Required'}
              </span>
            </label>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 justify-center disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {ar ? 'حفظ' : 'Save'}
            </button>
            <Link to="/admin/heritage" className="btn-outline flex-1 justify-center">
              {ar ? 'إلغاء' : 'Cancel'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
