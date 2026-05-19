import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export default function ListState({
  loading,
  fetching,
  isEmpty,
  emptyMessage,
  children,
  minHeight = 'min-h-[280px]',
}) {
  if (loading) {
    return (
      <div className={clsx('flex justify-center items-center py-20', minHeight)}>
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <p className={clsx('text-center text-on-surface-variant py-16', minHeight)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={clsx('relative', minHeight)}>
      <div
        className={clsx(
          'transition-opacity duration-200',
          fetching && 'opacity-60 pointer-events-none',
        )}
      >
        {children}
      </div>
      {fetching && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-7 h-7 animate-spin text-gold" />
        </div>
      )}
    </div>
  );
}
