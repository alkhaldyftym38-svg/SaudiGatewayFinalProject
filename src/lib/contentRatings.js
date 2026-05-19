export const RATING_TYPES = ['heritage', 'event', 'investment'];

export function ratingKey(itemType, itemId) {
  return `${itemType}:${String(itemId)}`;
}

export function parseRatingKey(key) {
  const i = key.indexOf(':');
  if (i < 1) return null;
  return { itemType: key.slice(0, i), itemId: key.slice(i + 1) };
}

export function publicPathForType(itemType, itemId) {
  if (itemType === 'heritage') return `/heritage/${itemId}`;
  if (itemType === 'event') return `/events/${itemId}`;
  if (itemType === 'investment') return '/investment';
  return '/';
}

export function adminEditPath(itemType, itemId) {
  if (itemType === 'heritage') return `/admin/heritage/${itemId}/edit`;
  if (itemType === 'event') return `/admin/events/${itemId}/edit`;
  return null;
}
