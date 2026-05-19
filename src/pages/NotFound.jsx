import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFound() {
  const { isRTL, language } = useApp();
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-extrabold text-gold/20 select-none mb-2">404</div>
        <h1 className="text-3xl font-bold text-on-surface mb-3">
          {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="text-on-surface-variant mb-8">
          {isAr
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold text-white font-semibold hover:bg-gold/90 transition-colors duration-200"
        >
          <Home className="w-4 h-4" />
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>
      </motion.div>
    </div>
  );
}
