import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, MessageSquare, TrendingUp, Landmark, ArrowRight, Shield, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useApp } from '../../context/AppContext';

const statCard = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
  const { language } = useApp();
  const ar = language === 'ar';
  const [stats, setStats] = useState({ heritage: 0, events: 0, investment: 0, users: 0, messages: 0, ratings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [h, e, inv, u, m, r] = await Promise.all([
          supabase.from('heritage_sites').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('investment_sectors').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('support_messages').select('id', { count: 'exact', head: true }),
          supabase.from('content_ratings').select('id', { count: 'exact', head: true }),
        ]);
        if (cancelled) return;
        setStats({
          heritage: h.count ?? 0,
          events: e.count ?? 0,
          investment: inv.count ?? 0,
          users: u.count ?? 0,
          messages: m.count ?? 0,
          ratings: r.count ?? 0,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    { icon: MapPin, label: ar ? 'مواقع التراث' : 'Heritage Sites', value: stats.heritage, to: '/admin/heritage', color: '#C9A84C' },
    { icon: Calendar, label: ar ? 'الفعاليات' : 'Events', value: stats.events, to: '/admin/events', color: '#2563EB' },
    { icon: TrendingUp, label: ar ? 'قطاعات الاستثمار' : 'Investment Sectors', value: stats.investment, to: '/admin/investment', color: '#059669' },
    { icon: Users, label: ar ? 'المستخدمون' : 'Users', value: stats.users, to: '/admin/users', color: '#006C35' },
    { icon: MessageSquare, label: ar ? 'رسائل الدعم' : 'Support Messages', value: stats.messages, to: '/admin/users?tab=messages', color: '#DC2626' },
    { icon: TrendingUp, label: ar ? 'التقييمات' : 'Ratings', value: stats.ratings, to: '/admin/ratings', color: '#7C3AED' },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {ar ? 'لوحة التحكم' : 'Admin Dashboard'}
            </h1>
            <p className="text-on-surface-variant text-sm">
              {ar ? 'إدارة محتوى المنصة' : 'Manage platform content'}
            </p>
          </div>
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10"
        >
          {cards.map((card) => (
            <motion.div key={card.label} variants={statCard}>
              <Link
                to={card.to}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-card hover:shadow-majlis transition-all group block"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <div className="text-2xl font-black text-on-surface mb-0.5">
                  {loading ? '—' : card.value}
                </div>
                <div className="text-xs text-on-surface-variant font-medium">{card.label}</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <h2 className="text-lg font-bold text-on-surface mb-4">
          {ar ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { to: '/admin/heritage', label: ar ? 'إدارة التراث' : 'Manage Heritage', icon: MapPin, color: '#C9A84C' },
            { to: '/admin/events', label: ar ? 'إدارة الفعاليات' : 'Manage Events', icon: Calendar, color: '#2563EB' },
            { to: '/admin/investment', label: ar ? 'إدارة الاستثمار' : 'Manage Investment', icon: Landmark, color: '#059669' },
            { to: '/admin/users', label: ar ? 'المستخدمون والدعم' : 'Users & Support', icon: Users, color: '#006C35' },
            { to: '/admin/ratings', label: ar ? 'التقييمات' : 'Ratings', icon: TrendingUp, color: '#7C3AED' },
            { to: '/admin/site', label: ar ? 'إدارة الموقع' : 'Site Settings', icon: Settings, color: '#0D9488' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-card hover:shadow-majlis transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `${link.color}15` }}>
                <link.icon className="w-6 h-6" style={{ color: link.color }} />
              </div>
              <span className="font-semibold text-on-surface flex-1">{link.label}</span>
              <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-gold transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
