
import { useApp } from '../../context/AppContext';

export function PageHeroLight({ badge, title, subtitle, children, className = '' }) {
  const { isRTL } = useApp();

  return (
    <section className={`relative pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden bg-surface ${className}`}>
      <div
        className={`absolute top-0 w-1/2 h-full max-h-[min(520px,100%)] opacity-[0.06] islamic-pattern-dots text-primary pointer-events-none ${
          isRTL ? 'left-0' : 'right-0'
        }`}
        aria-hidden
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        {badge}
        <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black text-on-surface leading-[1.1] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto mt-4 md:mt-5 leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
export function LightHeroBadge({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6">
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </span>
  );
}
export function LightHeroStatCard({ value, label }) {
  return (
    <div className="rounded-2xl px-4 py-5 md:py-6 bg-surface-container-lowest border border-outline-variant/15 shadow-card text-center">
      <div className="text-2xl md:text-3xl font-black text-gold tracking-tight tabular-nums">{value}</div>
      <div className="text-on-surface-variant text-[11px] md:text-xs mt-2 leading-snug font-medium">{label}</div>
    </div>
  );
}
