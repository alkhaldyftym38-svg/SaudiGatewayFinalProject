import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase, refreshSupabaseSession, testSupabaseConnection } from '../lib/supabaseClient';
import { ratingKey } from '../lib/contentRatings';
import { withTimeout } from '../lib/queryTimeout';

const AUTH_REQUEST_MS = 15_000;
const PROFILE_REQUEST_MS = 10_000;

const AppContext = createContext(null);
const LANG_STORAGE_KEY = 'saudi_gateway_lang';

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {}
  return 'en';
}

export function AppProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(readStoredLanguage);
  const [darkMode, setDarkMode] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [userRatings, setUserRatings] = useState({});

  const [supabaseStatus, setSupabaseStatus] = useState('idle');
  const [tabResumeCount, setTabResumeCount] = useState(0);

  const isRTL = language === 'ar';
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    i18n.changeLanguage(language);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {}
  }, [language, isRTL, i18n]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSupabaseStatus('checking');
      const result = await testSupabaseConnection();
      if (!cancelled) setSupabaseStatus(result.ok ? 'connected' : 'disconnected');
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let lastBump = 0;
    let wasHidden = false;

    const bumpResume = async () => {
      const now = Date.now();
      if (now - lastBump < 800) return;
      lastBump = now;
      await refreshSupabaseSession();
      setTabResumeCount((c) => c + 1);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        return;
      }
      if (document.visibilityState === 'visible' && wasHidden) {
        wasHidden = false;
        bumpResume();
      }
    };

    const onPageShow = (event) => {
      if (event.persisted) bumpResume();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);
  useEffect(() => {
    let mounted = true;

    const applySession = async (session) => {
      if (session) {
        await loadSessionUser(session.user);
      } else {
        setSessionUser(null);
        setFavorites([]);
        setSavedAnswers([]);
        setUserRatings({});
      }
    };

    (async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_REQUEST_MS,
        );
        if (!mounted) return;
        await applySession(session);
      } catch (e) {
        console.warn('getSession failed', e);
        if (mounted) setSessionUser(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setTimeout(() => {
        if (!mounted) return;
        void applySession(session);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('profiles')
          .select('name, role, is_blocked, deleted_at')
          .eq('id', userId)
          .maybeSingle(),
        PROFILE_REQUEST_MS,
      );
      if (error) console.warn('profile fetch', error.message);
      return data;
    } catch (e) {
      console.warn('profile fetch timeout', e);
      return null;
    }
  };

  const loadSessionUser = async (user) => {
    const meta = user.user_metadata ?? {};
    const profile = await fetchProfile(user.id);

    if (profile?.deleted_at || profile?.is_blocked) {
      await supabase.auth.signOut();
      setSessionUser(null);
      return;
    }

    const role = profile?.role === 'admin' || meta.role === 'admin' ? 'admin' : 'visitor';
    setSessionUser({
      id: user.id,
      email: user.email,
      name: profile?.name ?? meta.name ?? user.email.split('@')[0],
      role,
    });
  };
  useEffect(() => {
    if (!sessionUser) return;
    loadFavorites();
    loadSavedAnswers();
    loadUserRatings();
  }, [sessionUser?.id]);
  const loadFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', sessionUser.id);
    if (data) {
      setFavorites(data.map(row => ({
        id: row.item_id,
        type: row.item_type,
        name: row.title,
        title: row.title,
        image: row.image,
      })));
    }
  };

  const toggleFavorite = useCallback(async (item) => {
    if (!sessionUser) {
      setFavorites(prev => {
        const exists = prev.find(f => f.id === item.id);
        return exists ? prev.filter(f => f.id !== item.id) : [...prev, item];
      });
      return;
    }

    const exists = favorites.find(f => f.id === item.id);
    if (exists) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', sessionUser.id)
        .eq('item_id', item.id);
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      await supabase.from('favorites').upsert({
        user_id: sessionUser.id,
        item_id: item.id,
        item_type: item.type,
        title: item.name ?? item.title,
        image: item.image ?? null,
      });
      setFavorites(prev => [...prev, item]);
    }
  }, [sessionUser, favorites]);

  const isFavorite = useCallback((id) => favorites.some(f => f.id === id), [favorites]);
  const loadSavedAnswers = async () => {
    const { data } = await supabase
      .from('saved_answers')
      .select('*')
      .eq('user_id', sessionUser.id)
      .order('saved_at', { ascending: false });
    if (data) setSavedAnswers(data.map(row => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      links: row.links ?? [],
      savedAt: row.saved_at,
    })));
  };

  const saveAnswer = useCallback(async (answer) => {
    if (!sessionUser) {
      setSavedAnswers(prev => prev.find(a => a.id === answer.id) ? prev : [{ ...answer, savedAt: new Date().toISOString() }, ...prev]);
      return;
    }
    const { data, error } = await supabase.from('saved_answers').insert({
      user_id: sessionUser.id,
      question: answer.question,
      answer: answer.answer,
      links: answer.links ?? [],
    }).select().single();
    if (!error && data) {
      setSavedAnswers(prev => [{ id: data.id, question: data.question, answer: data.answer, links: data.links, savedAt: data.saved_at }, ...prev]);
    }
  }, [sessionUser]);

  const removeSavedAnswer = useCallback(async (id) => {
    if (sessionUser) {
      await supabase.from('saved_answers').delete().eq('id', id).eq('user_id', sessionUser.id);
    }
    setSavedAnswers(prev => prev.filter(a => a.id !== id));
  }, [sessionUser]);
  const loadUserRatings = async () => {
    const { data } = await supabase
      .from('content_ratings')
      .select('item_type, item_id, rating')
      .eq('user_id', sessionUser.id);
    if (data) {
      const map = {};
      data.forEach((r) => { map[ratingKey(r.item_type, r.item_id)] = r.rating; });
      setUserRatings(map);
    }
  };

  const rateContent = useCallback(async (itemType, itemId, rating) => {
    const key = ratingKey(itemType, itemId);
    setUserRatings((prev) => ({ ...prev, [key]: rating }));
    if (!sessionUser) return;
    await supabase.from('content_ratings').upsert({
      user_id: sessionUser.id,
      item_type: itemType,
      item_id: String(itemId),
      rating,
    }, { onConflict: 'user_id,item_type,item_id' });
  }, [sessionUser]);

  const getUserRating = useCallback(
    (itemType, itemId) => userRatings[ratingKey(itemType, itemId)] ?? 0,
    [userRatings],
  );
  const registerUser = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name: name.trim() } },
    });
    if (signUpError) {
      if (signUpError.message?.toLowerCase().includes('already')) return { ok: false, error: 'exists' };
      return { ok: false, error: signUpError.message };
    }
    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        return { ok: true, needsConfirmation: true };
      }
    }

    return { ok: true };
  };

  const loginUser = async ({ email, password }) => {
    let data;
    let error;
    try {
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        }),
        AUTH_REQUEST_MS,
      );
      data = result.data;
      error = result.error;
    } catch (e) {
      if (e?.message === 'request_timeout') return { ok: false, error: 'timeout' };
      throw e;
    }
    if (error) {
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('email not confirmed')) return { ok: false, error: 'unconfirmed' };
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
        return { ok: false, error: 'invalid' };
      }
      return { ok: false, error: 'invalid', raw: error.message };
    }

    const profile = await fetchProfile(data.user.id);

    if (profile?.is_blocked) {
      await supabase.auth.signOut();
      setSessionUser(null);
      return { ok: false, error: 'blocked' };
    }
    if (profile?.deleted_at) {
      await supabase.auth.signOut();
      setSessionUser(null);
      return { ok: false, error: 'deleted' };
    }

    const meta = data.user.user_metadata ?? {};
    const role = profile?.role === 'admin' || meta.role === 'admin' ? 'admin' : 'visitor';
    setSessionUser({
      id: data.user.id,
      email: data.user.email,
      name: profile?.name ?? meta.name ?? data.user.email.split('@')[0],
      role,
    });
    return { ok: true };
  };

  const logoutUser = () => {
    setSessionUser(null);
    setFavorites([]);
    setSavedAnswers([]);
    setUserRatings({});
    supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  };

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <AppContext.Provider value={{
      language, setLanguage, toggleLanguage, isRTL,
      darkMode, toggleDarkMode,
      favorites, toggleFavorite, isFavorite,
      savedAnswers, saveAnswer, removeSavedAnswer,
      userRatings, rateContent, getUserRating,
      sessionUser, authLoading, supabaseStatus, tabResumeCount,
      registerUser, loginUser, logoutUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
