import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import clsx from 'clsx';

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(t => String(t).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[,،]/).map(t => t.trim()).filter(Boolean);
  }
  return [];
}

export default function TagsInput({ value, onChange, label, ar, className }) {
  const tags = normalizeTags(value);
  const [input, setInput] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    const exists = tags.some(t => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setInput('');
      return;
    }
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className={clsx('sm:col-span-2', className)}>
      {label && (
        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
          {label}
        </label>
      )}
      <div
        className={clsx(
          'min-h-[46px] flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/30',
          'bg-surface px-2 py-2 focus-within:ring-2 focus-within:ring-gold/40 focus-within:border-gold transition-shadow',
        )}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-gold/15 text-gold-dark text-xs font-semibold"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 rounded-md hover:bg-gold/25 text-gold-dark/80 hover:text-gold-dark transition-colors"
              aria-label={ar ? `حذف ${tag}` : `Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? (ar ? 'اكتب واضغط Enter' : 'Type and press Enter') : ''}
          className="flex-1 min-w-[120px] bg-transparent border-0 outline-none text-sm text-on-surface px-1 py-0.5 placeholder:text-on-surface-variant/50"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={() => addTag(input)}
            className="p-1.5 rounded-lg bg-gold/15 text-gold-dark hover:bg-gold/25 transition-colors shrink-0"
            aria-label={ar ? 'إضافة' : 'Add'}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-on-surface-variant">
        {ar ? 'اكتب الكلمة واضغط Enter لإضافتها' : 'Type a word and press Enter to add it'}
      </p>
    </div>
  );
}
