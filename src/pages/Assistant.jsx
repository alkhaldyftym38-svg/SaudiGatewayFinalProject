import { motion } from 'framer-motion';
import AIAssistant from '../components/ai/AIAssistant';
import { useApp } from '../context/AppContext';

export default function Assistant() {
  const { isRTL } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-x-0 bottom-0 top-[4.75rem] z-30 flex flex-col bg-surface"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <AIAssistant variant="stitch" fullscreen />
      </div>
    </motion.div>
  );
}
