import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { formatNumber } from '../../lib/formatLocale';

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, lang = 'en' }) {
  const ar = lang === 'ar';
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-outline-variant/15">
      <p className="text-sm text-on-surface-variant">
        {ar
          ? `عرض ${formatNumber(from, lang)}–${formatNumber(to, lang)} من ${formatNumber(total, lang)}`
          : `Showing ${from}–${to} of ${total}`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label={ar ? 'السابق' : 'Previous'}
          >
            <ChevronLeft className={clsx('w-4 h-4', ar && 'rotate-180')} />
          </button>
          {pages.map((p, i) => (
            <span key={p} className="flex items-center">
              {i > 0 && pages[i - 1] !== p - 1 && (
                <span className="px-1 text-on-surface-variant/50">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={clsx(
                  'min-w-[2.25rem] h-9 px-2 rounded-xl text-sm font-semibold transition-colors',
                  p === page
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container',
                )}
              >
                {formatNumber(p, lang)}
              </button>
            </span>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-xl border border-outline-variant/25 text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label={ar ? 'التالي' : 'Next'}
          >
            <ChevronRight className={clsx('w-4 h-4', ar && 'rotate-180')} />
          </button>
        </div>
      )}
    </div>
  );
}
