import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && !loading && onClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-surface rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-outline-variant/10"
          >
            <div className="p-6 sm:p-8">
              <div
                className={clsx(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
                  variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-gold/15 text-gold-dark',
                )}
              >
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h2 id="confirm-dialog-title" className="text-xl font-bold text-on-surface mb-2">
                {title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
            </div>

            <div className="flex gap-3 p-4 sm:px-8 sm:pb-8 bg-surface-container-lowest/50 border-t border-outline-variant/10">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-outline flex-1 justify-center disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={clsx(
                  'flex-1 justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center gap-2',
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600 shadow-sm'
                    : 'btn-primary',
                )}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
