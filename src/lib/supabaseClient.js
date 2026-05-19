import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function refreshSupabaseSession() {
  try {
    const { error } = await supabase.auth.refreshSession();
    if (error) console.warn('refreshSession', error.message);
  } catch (e) {
    console.warn('refreshSession failed', e);
  }
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function testSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return { ok: false, reason: 'missing_env', message: 'Supabase environment variables are not configured.' };
  }
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { ok: false, reason: 'query_error', message: error.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'network_error', message: 'Could not reach Supabase endpoint.' };
  }
}
