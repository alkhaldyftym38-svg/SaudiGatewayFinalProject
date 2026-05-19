import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare, Mail, Phone, Headphones, Send,
  CheckCircle, Clock, Users, ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';

const SUPPORT_EMAIL = 'support@saudigateway.sa';
const SUPPORT_PHONE = '+966110000000';

const SUBJECT_KEYS = [
  'blocked', 'deleted', 'government', 'tourism',
  'investment', 'heritage', 'technical', 'other',
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const emptyForm = () => ({ name: '', email: '', subject: '', message: '' });

export default function Support() {
  const { t } = useTranslation();
  const location = useLocation();
  const { isRTL, sessionUser } = useApp();
  const formRef = useRef(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [showBlockedHint, setShowBlockedHint] = useState(false);

  const subjectLabel = (key) => t(`support.subjects.${key}`);

  const resetForm = (overrides = {}) => {
    setFormData({
      name: sessionUser?.name ?? '',
      email: sessionUser?.email ?? '',
      subject: '',
      message: '',
      ...overrides,
    });
  };

  useEffect(() => {
    const prefill = location.state?.supportPrefill;
    if (prefill) {
      setFormData((prev) => ({
        ...prev,
        name: prefill.name ?? prev.name,
        email: prefill.email ?? prev.email,
        subject: prefill.subject ?? prev.subject,
        message: prefill.message ?? prev.message,
      }));
      setShowBlockedHint(Boolean(prefill.fromAuth));
      window.history.replaceState({}, document.title);
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (sessionUser) {
      setFormData((prev) => ({
        ...prev,
        name: sessionUser.name || prev.name,
        email: sessionUser.email || prev.email,
      }));
    }
  }, [location.state, sessionUser]);

  const scrollToForm = (overrides = {}) => {
    if (Object.keys(overrides).length) {
      setFormData((prev) => ({ ...prev, ...overrides }));
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSendError('');
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject || null,
      message: formData.message.trim(),
      user_id: sessionUser?.id ?? null,
    });
    setSending(false);
    if (error) {
      setSendError(t('support.sendError'));
      return;
    }
    setSubmitted(true);
  };

  const contactOptions = [
    {
      icon: MessageSquare,
      title: t('support.chat'),
      color: '#C9A84C',
      desc: t('support.chatDesc'),
      action: t('support.startChat'),
      onClick: () => scrollToForm({
        subject: subjectLabel('technical'),
        message: '',
      }),
    },
    {
      icon: Phone,
      title: t('support.phone'),
      color: '#006C35',
      desc: '+966 11 000 0000',
      action: t('support.callNow'),
      href: `tel:${SUPPORT_PHONE}`,
    },
    {
      icon: Mail,
      title: t('support.email'),
      color: '#2563EB',
      desc: SUPPORT_EMAIL,
      action: t('support.sendEmail'),
      href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('support.formTitle'))}`,
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-surface"
      dir={isRTL ? 'rtl' : 'ltr'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeroLight
        badge={
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-block"
          >
            <LightHeroBadge icon={Headphones}>{t('nav.support')}</LightHeroBadge>
          </motion.span>
        }
        title={t('support.title')}
        subtitle={t('support.subtitle')}
      />

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          className="grid lg:grid-cols-3 gap-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="space-y-4">
            {contactOptions.map((opt, i) => {
              const inner = (
                <>
                  <motion.div
                    variants={fadeUp}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: `${opt.color}15` }}
                  >
                    <opt.icon className="w-6 h-6" style={{ color: opt.color }} />
                  </motion.div>
                  <div className="flex-1">
                    <motion.div variants={fadeUp} className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-on-surface">{opt.title}</h3>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-container/15 text-primary">
                        {t('support.hours')}
                      </span>
                    </motion.div>
                    <motion.p variants={fadeUp} className="text-on-surface-variant text-sm">{opt.desc}</motion.p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-gold transition-colors shrink-0" />
                </>
              );
              const cardClass =
                'bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 flex items-center gap-4 shadow-card hover:shadow-majlis transition-all duration-300 cursor-pointer group w-full text-start';

              if (opt.href) {
                return (
                  <motion.a
                    key={i}
                    variants={fadeUp}
                    href={opt.href}
                    className={cardClass}
                  >
                    {inner}
                  </motion.a>
                );
              }
              return (
                <motion.button
                  key={i}
                  type="button"
                  variants={fadeUp}
                  onClick={opt.onClick}
                  className={cardClass}
                >
                  {inner}
                </motion.button>
              );
            })}
            <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 mt-6 shadow-card">
              <h3 className="font-bold text-on-surface mb-4">{t('support.statsTitle')}</h3>
              {[
                { icon: Clock, label: t('support.avgResponse'), value: '< 2 min' },
                { icon: CheckCircle, label: t('support.issuesResolved'), value: '98.5%' },
                { icon: Users, label: t('support.happyCustomers'), value: '1M+' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-outline-variant/15 last:border-0">
                  <s.icon className="w-4 h-4 text-gold" />
                  <span className="text-on-surface-variant text-sm flex-1">{s.label}</span>
                  <span className="font-bold text-on-surface text-sm tabular-nums">{s.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            ref={formRef}
            id="support-form"
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 scroll-mt-24"
          >
            {submitted ? (
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-12 text-center h-full flex flex-col items-center justify-center shadow-card">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-20 h-20 rounded-full bg-primary-container/15 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-primary-container" />
                </motion.div>
                <h3 className="text-2xl font-bold text-on-surface mb-3">{t('support.successTitle')}</h3>
                <p className="text-on-surface-variant mb-8 max-w-sm">{t('support.successBody')}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setShowBlockedHint(false);
                    resetForm();
                  }}
                  className="btn-primary"
                >
                  {t('support.sendAnother')}
                </button>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 p-8 shadow-card">
                <h2 className="text-2xl font-bold text-on-surface mb-2">{t('support.formTitle')}</h2>
                {showBlockedHint && (
                  <p className="text-sm text-primary bg-primary-container/10 rounded-xl px-3 py-2 mb-4">
                    {t('support.blockedHint')}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                      <label className="block text-sm font-medium text-on-surface mb-1.5">
                        {t('support.fullName')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field"
                        placeholder={t('support.namePlaceholder')}
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                      <label className="block text-sm font-medium text-on-surface mb-1.5">
                        {t('support.emailLabel')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field"
                        placeholder="you@example.com"
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      {t('support.subject')}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field"
                    >
                      <option value="">{t('support.selectTopic')}</option>
                      {SUBJECT_KEYS.map((key) => (
                        <option key={key} value={subjectLabel(key)}>
                          {subjectLabel(key)}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <label className="block text-sm font-medium text-on-surface mb-1.5">
                      {t('support.message')}
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-field resize-none"
                      placeholder={t('support.messagePlaceholder')}
                    />
                  </motion.div>

                  {sendError && (
                    <p className="text-sm text-red-600 bg-red-500/10 rounded-xl px-3 py-2" role="alert">
                      {sendError}
                    </p>
                  )}
                  <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {sending ? t('support.sending') : t('support.sendMessage')}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
