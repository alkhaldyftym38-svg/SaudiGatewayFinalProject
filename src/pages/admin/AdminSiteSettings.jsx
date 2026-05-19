import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Bot, ImageIcon, KeyRound, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ui/ImageUploader';
import { useApp } from '../../context/AppContext';
import {
  DEFAULT_HOME_IMAGES,
  HOME_IMAGE_KEYS,
  resolveHomeImages,
} from '../../lib/homeImages';
import {
  fetchSiteSettings,
  maskSecret,
  SETTING_KEYS,
  upsertSiteSetting,
} from '../../lib/siteSettings';

const LLM_KEYS = [SETTING_KEYS.GROQ_API_KEY, SETTING_KEYS.GROQ_MODEL];
const HOME_KEYS = Object.values(HOME_IMAGE_KEYS);
const ALL_KEYS = [...LLM_KEYS, ...HOME_KEYS];

export default function AdminSiteSettings() {
  const { t } = useTranslation();
  const { language, isRTL } = useApp();
  const ar = language === 'ar';
  const Back = isRTL ? ArrowRight : ArrowLeft;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [model, setModel] = useState('llama-3.3-70b-versatile');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [homeImages, setHomeImages] = useState(DEFAULT_HOME_IMAGES);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const map = await fetchSiteSettings(ALL_KEYS);
      const keyRow = map[SETTING_KEYS.GROQ_API_KEY];
      const modelRow = map[SETTING_KEYS.GROQ_MODEL];
      const keyVal = keyRow?.value?.trim() ?? '';
      setHasApiKey(keyVal.length > 0);
      setMaskedKey(maskSecret(keyVal));
      setModel(modelRow?.value?.trim() || 'llama-3.3-70b-versatile');
      setUpdatedAt(keyRow?.updated_at || modelRow?.updated_at || null);
      setApiKeyInput('');
      const valueByKey = {};
      for (const k of HOME_KEYS) {
        valueByKey[k] = map[k]?.value ?? '';
      }
      setHomeImages(resolveHomeImages(valueByKey));
    } catch (e) {
      setError(e?.message || (ar ? 'تعذر تحميل الإعدادات' : 'Could not load settings'));
    } finally {
      setLoading(false);
    }
  }, [ar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const nextKey = apiKeyInput.trim();
      if (nextKey) {
        await upsertSiteSetting(SETTING_KEYS.GROQ_API_KEY, nextKey);
      } else if (!hasApiKey) {
        setError(t('adminSite.apiKeyRequired'));
        setSaving(false);
        return;
      }
      await upsertSiteSetting(SETTING_KEYS.GROQ_MODEL, model.trim() || 'llama-3.3-70b-versatile');
      await upsertSiteSetting(HOME_IMAGE_KEYS.HERO_SIDE, homeImages.heroSide.trim());
      await upsertSiteSetting(HOME_IMAGE_KEYS.HERITAGE, homeImages.heritage.trim());
      await upsertSiteSetting(HOME_IMAGE_KEYS.RIYADH, homeImages.riyadh.trim());
      setSuccess(true);
      setApiKeyInput('');
      await load();
    } catch (err) {
      setError(err?.message || (ar ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const setHomeField = (field, url) => {
    setHomeImages((prev) => ({ ...prev, [field]: url }));
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <Back className="w-4 h-4" />
          {t('adminSite.back')}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">{t('adminSite.title')}</h1>
            <p className="text-on-surface-variant text-sm">{t('adminSite.subtitle')}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-card p-6 space-y-5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <ImageIcon className="w-4 h-4" />
                {t('adminSite.homeSection')}
              </div>
              <p className="text-xs text-on-surface-variant">{t('adminSite.homeHint')}</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <ImageUploader
                    label={t('adminSite.homeHero')}
                    ar={ar}
                    value={homeImages.heroSide}
                    onChange={(url) => setHomeField('heroSide', url)}
                  />
                  <div className="rounded-xl overflow-hidden border border-outline-variant/20 aspect-[4/3] bg-surface-container">
                    <img src={homeImages.heroSide} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-3">
                  <ImageUploader
                    label={t('adminSite.homeHeritage')}
                    ar={ar}
                    value={homeImages.heritage}
                    onChange={(url) => setHomeField('heritage', url)}
                  />
                  <div className="rounded-xl overflow-hidden border border-outline-variant/20 aspect-[4/3] bg-surface-container">
                    <img src={homeImages.heritage} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <ImageUploader
                    label={t('adminSite.homeRiyadh')}
                    ar={ar}
                    value={homeImages.riyadh}
                    onChange={(url) => setHomeField('riyadh', url)}
                  />
                  <div className="rounded-xl overflow-hidden border border-outline-variant/20 aspect-[21/9] max-h-48 bg-surface-container">
                    <img src={homeImages.riyadh} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-card p-6 space-y-5">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Bot className="w-4 h-4" />
                {t('adminSite.llmSection')}
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  {t('adminSite.apiKey')}
                </label>
                {hasApiKey && !apiKeyInput && (
                  <p className="text-xs text-on-surface-variant mb-2 font-mono">
                    {t('adminSite.currentKey')}: {maskedKey}
                  </p>
                )}
                <input
                  type="password"
                  autoComplete="off"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasApiKey ? t('adminSite.apiKeyPlaceholderChange') : t('adminSite.apiKeyPlaceholder')}
                  className="w-full rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                <p className="text-xs text-on-surface-variant mt-2">{t('adminSite.apiKeyHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  {t('adminSite.model')}
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="llama-3.3-70b-versatile"
                  className="w-full rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
                <p className="text-xs text-on-surface-variant mt-2">{t('adminSite.modelHint')}</p>
              </div>

              {updatedAt && (
                <p className="text-xs text-on-surface-variant">
                  {t('adminSite.lastUpdated')}: {new Date(updatedAt).toLocaleString(ar ? 'ar-SA' : 'en-US')}
                </p>
              )}
            </section>

            {error && (
              <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-500/10 rounded-xl px-4 py-3">
                {t('adminSite.saved')}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto gap-2 justify-center disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t('adminSite.saving') : t('adminSite.save')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}