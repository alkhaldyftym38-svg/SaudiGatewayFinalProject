export const HERITAGE_CATEGORY_KEYS = {
  UNESCO: 'heritage.unesco',
  historical: 'heritage.historical',
  natural: 'heritage.natural',
  cultural: 'heritage.cultural',
};

export const EVENT_STATUS_KEYS = {
  upcoming: 'events.upcoming',
  ongoing: 'events.ongoing',
  past: 'events.past',
};

export const EVENT_CATEGORY_KEYS = {
  entertainment: 'events.categories.entertainment',
  cultural: 'events.categories.cultural',
  food: 'events.categories.food',
  environment: 'events.categories.environment',
  sports: 'events.categories.sports',
};

export function heritageCategoryLabel(value, t) {
  const key = HERITAGE_CATEGORY_KEYS[value];
  return key ? t(key) : value;
}

export function eventStatusLabel(value, t) {
  const key = EVENT_STATUS_KEYS[value];
  return key ? t(key) : value;
}

export function eventCategoryLabel(value, t) {
  const key = EVENT_CATEGORY_KEYS[value];
  return key ? t(key) : value;
}
