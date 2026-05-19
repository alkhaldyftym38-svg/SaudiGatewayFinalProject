import { useEffect, useMemo, useState } from 'react';
import { Clock, Sun, Sunset } from 'lucide-react';
import clsx from 'clsx';
import { formatVisitHours, parseVisitHours } from '../../lib/visitHours';

const PRESETS = [
  { id: 'morning', open: '08:00', close: '12:00', labelEn: 'Morning', labelAr: 'صباحاً' },
  { id: 'afternoon', open: '14:00', close: '18:00', labelEn: 'Afternoon', labelAr: 'مساءً' },
  { id: 'fullday', open: '09:00', close: '21:00', labelEn: 'Full day', labelAr: 'يوم كامل' },
  { id: 'evening', open: '16:00', close: '23:00', labelEn: 'Evening', labelAr: 'مسائية' },
];

export default function VisitHoursPicker({ valueEn, valueAr, onChange, ar }) {
  const [state, setState] = useState(() => parseVisitHours(valueEn, valueAr));

  useEffect(() => {
    const next = parseVisitHours(valueEn, valueAr);
    setState(prev => {
      const current = formatVisitHours(prev);
      if (current.en === valueEn && current.ar === valueAr) return prev;
      return next;
    });
  }, [valueEn, valueAr]);

  const emit = (next) => {
    setState(next);
    onChange(formatVisitHours(next));
  };

  const preview = useMemo(() => formatVisitHours(state), [state]);

  const modes = [
    { id: 'range', icon: Clock, labelEn: 'Fixed hours', labelAr: 'ساعات محددة' },
    { id: 'always', icon: Sun, labelEn: 'Open daily', labelAr: 'مفتوح يومياً' },
    { id: 'sunrise', icon: Sunset, labelEn: 'Sunrise – Sunset', labelAr: 'شروق – غروب' },
  ];

  return (
    <div className="sm:col-span-2 space-y-4">
      <label className="block text-xs font-semibold text-on-surface-variant">
        {ar ? 'ساعات الزيارة' : 'Visit hours'}
      </label>

      <div className="flex flex-wrap gap-2">
        {modes.map(({ id, icon: Icon, labelEn, labelAr }) => (
          <button
            key={id}
            type="button"
            onClick={() => emit({ ...state, mode: id })}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
              state.mode === id
                ? 'bg-gold/15 border-gold text-gold-dark shadow-gold'
                : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-gold/40',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {ar ? labelAr : labelEn}
          </button>
        ))}
      </div>

      {state.mode === 'range' && (
        <div className="rounded-2xl border border-outline-variant/20 bg-surface p-4 space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TimeField
              id="visit-open"
              label={ar ? 'وقت الفتح' : 'Opens at'}
              value={state.open}
              onChange={open => emit({ ...state, open })}
            />
            <TimeField
              id="visit-close"
              label={ar ? 'وقت الإغلاق' : 'Closes at'}
              value={state.close}
              onChange={close => emit({ ...state, close })}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {PRESETS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => emit({ ...state, mode: 'range', open: p.open, close: p.close })}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-container text-on-surface-variant hover:bg-gold/10 hover:text-gold-dark transition-colors"
              >
                {ar ? p.labelAr : p.labelEn}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant px-1">
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2.5 py-1.5">
          <span className="font-semibold text-on-surface/70">EN</span>
          {preview.en}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-surface-container px-2.5 py-1.5" dir="rtl">
          <span className="font-semibold text-on-surface/70">AR</span>
          {preview.ar}
        </span>
      </div>
    </div>
  );
}

function TimeField({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-on-surface-variant mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Clock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold pointer-events-none" />
        <input
          id={id}
          type="time"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={clsx(
            'w-full rounded-xl border border-outline-variant/30 bg-surface',
            'ps-10 pe-3 py-2.5 text-sm text-on-surface font-medium',
            'focus:ring-2 focus:ring-gold/40 focus:border-gold outline-none',
            '[color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
          )}
        />
      </div>
    </div>
  );
}
