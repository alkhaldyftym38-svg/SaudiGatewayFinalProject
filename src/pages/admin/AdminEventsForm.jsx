import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react';
import { EVENTS_FOCUS_KEY } from '../../lib/adminFocus';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';
import ImageUploader from '../../components/ui/ImageUploader';
import TagsInput from '../../components/ui/TagsInput';
import { eventCategoryLabel, eventStatusLabel } from '../../lib/selectOptions';

const exampleEvent = {
  title_en: 'Example Event',
  title_ar: 'فعالية تجريبية',
  status: 'upcoming',
  category: 'entertainment',
  location_en: 'Riyadh',
  location_ar: 'الرياض',
  date: '2026-12-01',
  end_date: '2026-12-31',
  desc_en: 'A sample event for testing. You can save as-is or edit any field.',
  desc_ar: 'فعالية تجريبية للاختبار. يمكنك الحفظ مباشرة أو تعديل أي حقل.',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  is_free: false,
  price: 'Varies',
  tags: ['entertainment', 'culture', 'sample'],
  color: '#C9A84C',
  organizer: 'Example Organizer',
  website: 'https://example.com',
};

const statuses = ['upcoming', 'ongoing', 'past'];
const categories = ['entertainment', 'cultural', 'food', 'environment', 'sports'];

export default function AdminEventsForm() {
  const { id } = useParams();
  const isEdit = Boolean(useMatch('/admin/events/:id/edit'));
  const navigate = useNavigate();
  const { language } = useApp();
  const { t } = useTranslation();
  const ar = language === 'ar';

  const [form, setForm] = useState(isEdit ? { ...exampleEvent, title_en: '', title_ar: '' } : exampleEvent);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (cancelled) return;
      if (fetchErr || !data) {
        setError(ar ? 'الفعالية غير موجودة' : 'Event not found');
        setLoading(false);
        return;
      }
      setForm({
        ...data,
        tags: data.tags ?? [],
        date: data.date ?? '',
        end_date: data.end_date ?? '',
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, ar]);

  const handleSave = async () => {
    if (!form.title_en.trim() || !form.title_ar.trim()) {
      setError(ar ? 'العنوانان مطلوبان' : 'Both titles are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { id: _id, created_at, ...fields } = form;
      const payload = {
        ...fields,
        tags: Array.isArray(form.tags) ? form.tags : [],
        is_free: Boolean(form.is_free),
        date: form.date || null,
        end_date: form.end_date || null,
      };
      const { data: saved, error: err } = isEdit
        ? await supabase.from('events').update(payload).eq('id', id).select('id').single()
        : await supabase.from('events').insert(payload).select('id').single();
      setSaving(false);
      if (err) {
        setError(err.message);
        return;
      }
      const focusId = saved?.id ?? id;
      if (focusId) sessionStorage.setItem(EVENTS_FOCUS_KEY, focusId);
      navigate('/admin/events', { state: { focusId } });
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
          to="/admin/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {ar ? 'العودة إلى القائمة' : 'Back to list'}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-on-surface">
            {isEdit ? (ar ? 'تعديل الفعالية' : 'Edit Event') : (ar ? 'إضافة فعالية' : 'Add Event')}
          </h1>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card p-6 sm:p-8">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-6">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('status', ar ? 'الحالة' : 'Status', 'select', {
              options: statuses,
              optionLabel: v => eventStatusLabel(v, t),
            })}
            {field('title_en', ar ? 'العنوان (EN)' : 'Title (EN)')}
            {field('title_ar', ar ? 'العنوان (AR)' : 'Title (AR)')}
            {field('category', ar ? 'التصنيف' : 'Category', 'select', {
              options: categories,
              optionLabel: v => eventCategoryLabel(v, t),
            })}
            {field('organizer', ar ? 'الجهة المنظمة' : 'Organizer')}
            {field('location_en', ar ? 'المكان (EN)' : 'Location (EN)')}
            {field('location_ar', ar ? 'المكان (AR)' : 'Location (AR)')}
            {field('date', ar ? 'تاريخ البداية' : 'Start Date', 'date')}
            {field('end_date', ar ? 'تاريخ النهاية' : 'End Date', 'date')}
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
            {field('website', ar ? 'الموقع الإلكتروني' : 'Website URL')}
            {field('price', ar ? 'السعر' : 'Price')}
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
                checked={Boolean(form.is_free)}
                onChange={e => setForm(p => ({ ...p, is_free: e.target.checked }))}
                className="w-4 h-4 accent-primary shrink-0"
              />
              <span className="text-sm font-semibold text-on-surface">
                {ar ? 'مجاني' : 'Free Entry'}
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
            <Link to="/admin/events" className="btn-outline flex-1 justify-center">
              {ar ? 'إلغاء' : 'Cancel'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
