export default function Badge({ children, variant = 'gold', className = '' }) {
  const variants = {
    gold: 'bg-gold/10 text-gold-dark border border-gold/30',
    green: 'bg-saudiGreen/10 text-saudiGreen border border-saudiGreen/30',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    gray: 'bg-gray-100 text-gray-600 border border-gray-200',
    free: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
