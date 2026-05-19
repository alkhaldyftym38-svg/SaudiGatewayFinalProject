import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resolvePostAuthPath } from '../lib/authRedirect';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, loginUser, sessionUser, authLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (authLoading || !sessionUser) return;
    navigate(resolvePostAuthPath(sessionUser, location.state?.from), { replace: true });
  }, [sessionUser, authLoading, location.state?.from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorKind('');
    if (!email.trim() || !password) {
      setError(t('auth.errorRequired'));
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (!res.ok) {
        if (res.error === 'unconfirmed') {
          setError(isRTL
            ? 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.'
            : 'Please confirm your email first. Check your inbox.');
        } else if (res.error === 'blocked') {
          setError(t('auth.errorBlocked'));
          setErrorKind('blocked');
        } else if (res.error === 'deleted') {
          setError(t('auth.errorDeleted'));
          setErrorKind('deleted');
        } else if (res.error === 'timeout') {
          setError(isRTL
            ? 'انتهت مهلة الاتصال. تحقق من الشبكة وحاول مرة أخرى.'
            : 'Connection timed out. Check your network and try again.');
        } else {
          setError(t('auth.errorInvalidCredentials'));
        }
      }
    } finally {
      setLoading(false);
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
            <LightHeroBadge icon={LogIn}>{t('auth.loginTitle')}</LightHeroBadge>
          </motion.span>
        }
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
      />

      <div className="max-w-md mx-auto px-4 sm:px-6 pb-20">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 sm:p-8 shadow-card space-y-4"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl px-3 py-2 space-y-2"
              role="alert"
            >
              <p>{error}</p>
              {(errorKind === 'blocked' || errorKind === 'deleted') && (
                <Link
                  to="/support"
                  state={{
                    supportPrefill: {
                      email: email.trim(),
                      subject: errorKind === 'blocked'
                        ? t('support.subjects.blocked')
                        : t('support.subjects.deleted'),
                      message: errorKind === 'blocked'
                        ? (isRTL
                          ? 'تم حظر حسابي وأود مراجعة الحالة مع فريق الدعم.'
                          : 'My account was blocked and I would like support to review my case.')
                        : (isRTL
                          ? 'حسابي غير متاح وأود المساعدة في استعادته.'
                          : 'My account is unavailable and I need help restoring access.'),
                      fromAuth: true,
                    },
                  }}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  {t('auth.contactSupport')} →
                </Link>
              )}
            </motion.div>
          )}
          <div>
            <label htmlFor="login-email" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.email')}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-semibold text-on-surface mb-1">
              {t('auth.password')}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-on-secondary-fixed py-3.5 rounded-xl font-bold shadow-sm hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? (t('common.loading') || '...') : t('auth.submitLogin')}
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              {t('auth.registerTitle')}
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
