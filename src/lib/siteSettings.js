import { supabase } from './supabaseClient';

export const SETTING_KEYS = {
  GROQ_API_KEY: 'groq_api_key',
  GROQ_MODEL: 'groq_model',
};

export function maskSecret(value) {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim();
  if (v.length <= 8) return '••••••••';
  return `${'•'.repeat(Math.min(12, v.length - 4))}${v.slice(-4)}`;
}

export async function fetchSiteSettings(keys) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value, is_secret, label_en, label_ar, updated_at')
    .in('key', keys);
  if (error) throw error;
  const map = {};
  for (const row of data ?? []) {
    map[row.key] = row;
  }
  return map;
}

export async function upsertSiteSetting(key, value) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: value ?? '' }, { onConflict: 'key' });
  if (error) throw error;
}
