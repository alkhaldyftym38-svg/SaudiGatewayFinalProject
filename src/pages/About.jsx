import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Bot, Globe, Shield, Zap, Heart, Users, Star, ChevronRight, Mail, Phone, MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeroLight, LightHeroBadge } from '../components/layout/PageHeroLight';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const teamMembers = [
  {
    nameEn: 'Fatimah Saleh Alkhaldi', nameAr: 'فاطمة صالح الخالدي',
    roleEn: 'Team Member', roleAr: 'عضو الفريق',
    id: '2231006440', emoji: '👩‍💻',
  },
  {
    nameEn: 'Amjad Al-Ghamdi', nameAr: 'أمجاد الغامدي',
    roleEn: 'Team Member', roleAr: 'عضو الفريق',
    id: '2231001756', emoji: '👩‍💻',
  },
  {
    nameEn: 'Maram Lafi Alharbi', nameAr: 'مرام لافي الحربي',
    roleEn: 'Team Member', roleAr: 'عضو الفريق',
    id: '2231006724', emoji: '👩‍💻',
  },
  {
    nameEn: 'Lujain Ali Alshammari', nameAr: 'لجين علي الشمري',
    roleEn: 'Team Member', roleAr: 'عضو الفريق',
    id: '2231003706', emoji: '👩‍💻',
  },
  {
    nameEn: 'EMAN AL-JMAEELY', nameAr: 'إيمان الجميلي',
    roleEn: 'Team Member', roleAr: 'عضو الفريق',
    id: '2231003080', emoji: '👩‍💻',
  },
];

const values = [
  { icon: Bot, titleEn: 'AI-First', titleAr: 'الذكاء الاصطناعي أولاً', descEn: 'We leverage cutting-edge AI to provide accurate, instant answers', descAr: 'نستخدم أحدث تقنيات الذكاء الاصطناعي لتقديم إجابات دقيقة وفورية', color: '#C9A84C' },
  { icon: Globe, titleEn: 'Bilingual', titleAr: 'ثنائي اللغة', descEn: 'Full Arabic and English support, built for Saudi culture', descAr: 'دعم كامل للعربية والإنجليزية، مصمم للثقافة السعودية', color: '#006C35' },
  { icon: Shield, titleEn: 'Trustworthy', titleAr: 'موثوق', descEn: 'Verified information from official Saudi government sources', descAr: 'معلومات موثقة من مصادر حكومية سعودية رسمية', color: '#2563EB' },
  { icon: Zap, titleEn: 'Instant', titleAr: 'فوري', descEn: 'Real-time answers powered by AI and official data', descAr: 'إجابات فورية مدعومة بالذكاء الاصطناعي والبيانات الرسمية', color: '#F59E0B' },
  { icon: Heart, titleEn: 'User-Centric', titleAr: 'يركز على المستخدم', descEn: 'Designed with empathy for citizens, residents, and tourists', descAr: 'مصمم بتعاطف للمواطنين والمقيمين والسياح', color: '#DC2626' },
  { icon: Users, titleEn: 'Inclusive', titleAr: 'شامل للجميع', descEn: 'Accessible to all users regardless of tech experience', descAr: 'متاح لجميع المستخدمين بصرف النظر عن مستواهم التقني', color: '#8B5CF6' },
];

export default function About() {
  const { t } = useTranslation();
  const { isRTL, language } = useApp();
  const lang = language;

  return (
    <div className="min-h-screen bg-surface" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeroLight
        className="pb-16 md:pb-20"
        badge={
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-block"
          >
            <LightHeroBadge icon={Star}>
              {lang === 'ar' ? 'من نحن' : 'About Us'}
            </LightHeroBadge>
          </motion.span>
        }
        title={t('about.title')}
        subtitle={t('about.subtitle')}
      />
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className={isRTL ? 'text-right' : 'text-left'}
            >
              <motion.span variants={fadeUp} className="badge-gold mb-4 inline-flex">
                {t('about.mission')}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-on-surface mb-6">
                {lang === 'ar'
                  ? 'نجعل المملكة في متناول الجميع'
                  : 'Making Saudi Arabia Accessible to All'}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-on-surface-variant leading-relaxed mb-6">
                {lang === 'ar'
                  ? 'Saudi Getaway هو منصة ذكية تجمع بين التراث السعودي والفعاليات وفرص الاستثمار في مكان واحد، مدعومة بمساعد ذكاء اصطناعي يجيب على الاستفسارات باللغتين العربية والإنجليزية.'
                  : 'Saudi Getaway is a smart platform that brings together Saudi heritage, events, and investment opportunities in one place, powered by an AI assistant that answers queries in both Arabic and English.'}
              </motion.p>
              <motion.p variants={fadeUp} className="text-on-surface-variant leading-relaxed mb-8">
                {lang === 'ar'
                  ? 'طُوّر هذا المشروع كمشروع تخرج في جامعة حفر الباطن، قسم علوم الحاسب والهندسة، الفصل الدراسي 225-2، بإشراف الدكتورة مزيونة الفاغم.'
                  : 'This project was developed as a graduation project at the University of Hafr Al Batin, Department of Computer Science and Engineering, Term 225-2, under the supervision of Dr. Mazyounah Al-Fagham.'}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  {lang === 'ar' ? 'مشروع تخرج 2026' : 'Graduation Project 2026'}
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="w-2 h-2 bg-saudiGreen rounded-full" />
                  {lang === 'ar' ? 'جامعة حفر الباطن' : 'University of Hafr Al Batin'}
                </div>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  {lang === 'ar' ? 'لغتان' : '2 Languages'}
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-5"
            >
              {[
                { value: '5', labelAr: 'أعضاء فريق العمل', labelEn: 'Team Members', color: '#C9A84C' },
                { value: '2026', labelAr: 'مشروع التخرج', labelEn: 'Graduation Project', color: '#006C35' },
                { value: 'UHB', labelAr: 'جامعة حفر الباطن', labelEn: 'Hafr Al Batin', color: '#2563EB' },
                { value: '225-2', labelAr: 'الفصل الدراسي', labelEn: 'Academic Term', color: '#8B5CF6' },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-card text-center">
                  <div className="text-3xl font-extrabold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-on-surface-variant text-sm">{lang === 'ar' ? stat.labelAr : stat.labelEn}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
              <motion.div variants={fadeUp} className={`mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
              <span className="badge-gold mb-4 inline-flex">{lang === 'ar' ? 'قيمنا' : 'Our Values'}</span>
              <h2 className="section-title text-on-surface">
                {lang === 'ar' ? 'ما يميزنا' : 'What Sets Us Apart'}
              </h2>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card hover:shadow-majlis transition-shadow p-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${v.color}15` }}
                  >
                    <v.icon className="w-6 h-6" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-bold text-on-surface mb-2">{lang === 'ar' ? v.titleAr : v.titleEn}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'ar' ? v.descAr : v.descEn}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
            <span className="badge-gold mb-4 inline-flex">{lang === 'ar' ? 'فريقنا' : 'Our Team'}</span>
            <h2 className="section-title text-on-surface">{t('about.team')}</h2>
          </div>
          <div className="flex justify-center mb-10">
            <div className="bg-gradient-to-br from-gold/10 to-saudiGreen/10 border border-gold/20 rounded-3xl p-6 text-center w-56 shadow-card">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-saudiGreen/30 flex items-center justify-center text-4xl mx-auto mb-3">
                👩‍🏫
              </div>
              <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-widest">
                {lang === 'ar' ? 'المشرفة' : 'Supervisor'}
              </p>
              <h3 className="font-bold text-on-surface text-base">Dr. Mazyounah Al-Fagham</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {teamMembers.map((member, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card hover:shadow-majlis transition-shadow p-5 text-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-saudiGreen/20 flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  {member.emoji}
                </div>
                <h3 className="font-bold text-on-surface mb-1 text-sm leading-snug">
                  {lang === 'ar' ? member.nameAr : member.nameEn}
                </h3>
                <p className="text-on-surface-variant text-xs font-mono mt-1">{member.id}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeUp} className="section-title text-on-surface">
              {t('about.contact')}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-on-surface-variant mb-12">
              {lang === 'ar' ? 'نحن هنا للمساعدة' : "We're here to help"}
            </motion.p>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Mail, title: 'Email', value: 'info@saudigateway.sa', href: 'mailto:info@saudigateway.sa', color: '#C9A84C' },
                { icon: Phone, title: lang === 'ar' ? 'هاتف' : 'Phone', value: '+966 11 000 0000', href: 'tel:+96611000000', color: '#006C35' },
                { icon: MapPin, title: lang === 'ar' ? 'العنوان' : 'Address', value: lang === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia', href: '#', color: '#2563EB' },
              ].map((c, i) => (
                <motion.a
                  key={i}
                  variants={fadeUp}
                  href={c.href}
                  className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-card hover:shadow-majlis transition-shadow p-6 flex flex-col items-center gap-3 group"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `${c.color}15` }}
                  >
                    <c.icon className="w-6 h-6" style={{ color: c.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface mb-1">{c.title}</p>
                    <p className="text-on-surface-variant text-sm">{c.value}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
