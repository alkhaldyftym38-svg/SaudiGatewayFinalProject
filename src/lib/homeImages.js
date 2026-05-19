import { supabase } from './supabaseClient';

export const HOME_IMAGE_KEYS = {
  HERO_SIDE: 'home_image_hero_side',
  HERITAGE: 'home_image_heritage',
  RIYADH: 'home_image_riyadh',
};

export const DEFAULT_HOME_IMAGES = {
  heroSide: 'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?auto=format&fit=crop&w=1200&q=80',
  heritage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  riyadh: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
};

const ALL_HOME_KEYS = Object.values(HOME_IMAGE_KEYS);

export function resolveHomeImages(valueByKey) {
  const pick = (key, fallback) => {
    const v = valueByKey?.[key];
    return typeof v === 'string' && v.trim() ? v.trim() : fallback;
  };
  return {
    heroSide: pick(HOME_IMAGE_KEYS.HERO_SIDE, DEFAULT_HOME_IMAGES.heroSide),
    heritage: pick(HOME_IMAGE_KEYS.HERITAGE, DEFAULT_HOME_IMAGES.heritage),
    riyadh: pick(HOME_IMAGE_KEYS.RIYADH, DEFAULT_HOME_IMAGES.riyadh),
  };
}

export async function fetchHomeImages() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ALL_HOME_KEYS)
    .eq('is_secret', false);

  if (error) {
    console.warn('fetchHomeImages', error.message);
    return DEFAULT_HOME_IMAGES;
  }

  const map = {};
  for (const row of data ?? []) {
    map[row.key] = row.value;
  }
  return resolveHomeImages(map);
}
