export function normalizeOutboundLink(url) {
  const trimmed = (url ?? '').trim();
  if (!trimmed || trimmed === '#') return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidOutboundLink(url) {
  const normalized = normalizeOutboundLink(url);
  if (normalized === '#') return true;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
