import { Search } from 'lucide-react';
import clsx from 'clsx';

export function FilterSelect({ value, onChange, options, label, ar, className }) {
  return (
    <label className={clsx('flex flex-col gap-1 min-w-[8rem]', className)}>
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 px-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function ListToolbar({ search, onSearchChange, placeholder, ar, children }) {
  return (
    <div className="mb-6 flex flex-col lg:flex-row gap-3">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-on-surface-variant pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 ps-10 pe-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      {children && (
        <div className="flex flex-wrap items-end gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
