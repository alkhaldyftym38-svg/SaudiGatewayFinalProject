import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resolvePostAuthPath } from '../lib/authRedirect';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { UserPlus, MailCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, registerUser, sessionUser, authLoading } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  useEffect(() => {
    if (authLoading || !sessionUser) return;
    navigate(resolvePostAuthPath(sessionUser, location.state?.from), { replace: true });
  }, [sessionUser, authLoading, location.state?.from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError(t('auth.errorRequired'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.errorPasswordMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errorPasswordShort'));
      return;
    }
    setLoading(true);
    const res = await registerUser({ name, email, password });
    setLoading(false);
    if (!res.ok && res.error === 'exists') {
      setError(t('auth.errorEmailExists'));
      return;
    }
    if (!res.ok) {
      setError(res.error || t('auth.errorRequired'));
      return;
    }
    if (res.needsConfirmation) {
      setConfirmSent(true);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeroLight
        badge={
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-block"
          >
            <LightHeroBadge icon={UserPlus}>{t('auth.registerTitle')}</LightHeroBadge>
          </motion.span>
        }
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
      />

      <div className="max-w-md mx-auto px-4 sm:px-6 pb-20">
        {confirmSent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-card text-center space-y-5"
          >
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
              <MailCheck className="w-8 h-8 text-gold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface mb-2">
                {isRTL ? 'أكّد بريدك الإلكتروني' : 'Confirm your email'}
              </h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {isRTL
                  ? `أرسلنا رابط تأكيد إلى `
                  : `We sent a confirmation link to `}
                <span className="font-semibold text-on-surface">{email}</span>
                {isRTL
                  ? `. افتح الرسالة وانقر على الرابط لتفعيل حسابك.`
                  : `. Open the email and click the link to activate your account.`}
              </p>
            </div>

            <div className="bg-surface-container rounded-xl p-4 text-sm text-on-surface-variant space-y-1.5 text-start">
              <p className="font-semibold text-on-surface">
                {isRTL ? 'خطوات التفعيل:' : 'Activation steps:'}
              </p>
              <p>1. {isRTL ? 'افتح بريدك الإلكتروني' : 'Open your email inbox'}</p>
              <p>2. {isRTL ? 'ابحث عن رسالة من Saudi Gateway' : 'Find an email from Saudi Gateway'}</p>
              <p>3. {isRTL ? 'انقر على "Confirm your email"' : 'Click "Confirm your email"'}</p>
              <p>4. {isRTL ? 'ستُوجَّه تلقائياً للموقع وتدخل مباشرة' : 'You\'ll be redirected and logged in automatically'}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn-primary justify-center">
                {isRTL ? 'الذهاب لتسجيل الدخول' : 'Go to Login'}
              </Link>
              <button
                type="button"
                disabled={resending || resent}
                onClick={async () => {
                  setResending(true);
                  await supabase.auth.resend({ type: 'signup', email });
                  setResending(false);
                  setResent(true);
                }}
                className="flex items-center justify-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resent
                  ? (isRTL ? 'تم إعادة الإرسال ✓' : 'Resent ✓')
                  : (isRTL ? 'أعد إرسال رابط التأكيد' : 'Resend confirmation email')}
              </button>
            </div>
          </motion.div>
        )}
        {!confirmSent && <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 sm:p-8 shadow-card space-y-4"
        >
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl px-3 py-2" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.name')}
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.email')}
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.password')}
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-on-secondary-fixed py-3.5 rounded-xl font-bold shadow-sm hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? (t('common.loading') || '...') : t('auth.submitRegister')}
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              {t('auth.loginTitle')}
            </Link>
          </p>
        </motion.form>}
      </div>
    </div>
  );
}
