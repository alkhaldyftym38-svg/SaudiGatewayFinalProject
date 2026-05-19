const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function toWesternDigits(value) {
  return String(value).replace(/[٠-٩]/g, ch => String(AR_DIGITS.indexOf(ch)));
}

function format12En(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

function format12Ar(hour, minute) {
  const period = hour >= 12 ? 'م' : 'ص';
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, '0')} ${period}`;
}

function parseSingleTime(raw) {
  const s = toWesternDigits(raw.trim());
  const m24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return `${m24[1].padStart(2, '0')}:${m24[2]}`;
  }
  const m12 = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm|ص|م)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = m12[2];
    const p = m12[3].toLowerCase();
    if ((p === 'pm' || p === 'م') && h !== 12) h += 12;
    if ((p === 'am' || p === 'ص') && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  return null;
}

export function parseVisitHours(en = '', ar = '') {
  const text = toWesternDigits(en || ar || '');
  if (/open daily|مفتوح\s*يومياً/i.test(text)) {
    return { mode: 'always', open: '09:00', close: '18:00' };
  }
  if (/sunrise|sunset|شروق|غروب/i.test(text)) {
    return { mode: 'sunrise', open: '06:00', close: '18:00' };
  }
  const parts = text.split(/\s*[-–—]\s*/);
  if (parts.length >= 2) {
    return {
      mode: 'range',
      open: parseSingleTime(parts[0]) ?? '09:00',
      close: parseSingleTime(parts[1]) ?? '18:00',
    };
  }
  return { mode: 'range', open: '09:00', close: '18:00' };
}

export function formatVisitHours({ mode, open, close }) {
  if (mode === 'always') {
    return { en: 'Open daily', ar: 'مفتوح يومياً' };
  }
  if (mode === 'sunrise') {
    return { en: 'Sunrise to Sunset', ar: 'من الشروق إلى الغروب' };
  }
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  return {
    en: `${format12En(oh, om)} - ${format12En(ch, cm)}`,
    ar: `${format12Ar(oh, om)} - ${format12Ar(ch, cm)}`,
  };
}
