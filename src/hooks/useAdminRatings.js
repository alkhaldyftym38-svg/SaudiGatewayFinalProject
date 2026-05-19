import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RATING_TYPES } from '../lib/contentRatings';

const SEARCH_DEBOUNCE_MS = 350;
const SELECT = 'id, item_type, item_id, rating, created_at';

async function enrichRatings(rows) {
  if (!rows?.length) return [];

  const byType = rows.reduce((acc, row) => {
    (acc[row.item_type] ??= []).push(row.item_id);
    return acc;
  }, {});

  const [heritageRes, eventsRes, investmentRes] = await Promise.all([
    byType.heritage?.length
      ? supabase.from('heritage_sites').select('id, name_en, name_ar, image').in('id', byType.heritage)
      : Promise.resolve({ data: [] }),
    byType.event?.length
      ? supabase.from('events').select('id, title_en, title_ar, image').in('id', byType.event)
      : Promise.resolve({ data: [] }),
    byType.investment?.length
      ? supabase.from('investment_sectors').select('id, name_en, name_ar, icon, color').in('id', byType.investment)
      : Promise.resolve({ data: [] }),
  ]);

  const heritageMap = Object.fromEntries((heritageRes.data ?? []).map((s) => [String(s.id), s]));
  const eventsMap = Object.fromEntries((eventsRes.data ?? []).map((s) => [String(s.id), s]));
  const investmentMap = Object.fromEntries((investmentRes.data ?? []).map((s) => [String(s.id), s]));

  return rows.map((row) => ({
    ...row,
    item:
      row.item_type === 'heritage'
        ? heritageMap[row.item_id] ?? null
        : row.item_type === 'event'
          ? eventsMap[row.item_id] ?? null
          : investmentMap[row.item_id] ?? null,
  }));
}

async function searchItemIds(term, itemType) {
  const types = itemType === 'all' ? RATING_TYPES : RATING_TYPES.filter((t) => t === itemType);
  const matches = [];

  if (types.includes('heritage')) {
    const { data } = await supabase
      .from('heritage_sites')
      .select('id')
      .or(`name_en.ilike.%${term}%,name_ar.ilike.%${term}%,id.ilike.%${term}%`);
    matches.push(...(data ?? []).map((s) => ({ item_type: 'heritage', item_id: String(s.id) })));
  }
  if (types.includes('event')) {
    const { data } = await supabase
      .from('events')
      .select('id')
      .or(`title_en.ilike.%${term}%,title_ar.ilike.%${term}%,id.ilike.%${term}%`);
    matches.push(...(data ?? []).map((s) => ({ item_type: 'event', item_id: String(s.id) })));
  }
  if (types.includes('investment')) {
    const { data } = await supabase
      .from('investment_sectors')
      .select('id')
      .or(`name_en.ilike.%${term}%,name_ar.ilike.%${term}%,id.ilike.%${term}%`);
    matches.push(...(data ?? []).map((s) => ({ item_type: 'investment', item_id: String(s.id) })));
  }

  return matches;
}

export function useAdminRatings({ pageSize = 10, search = '', stars = 'all', category = 'all' }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const filterKey = useMemo(
    () => JSON.stringify({ search: debouncedSearch, stars, category }),
    [debouncedSearch, stars, category],
  );

  const fetchPage = useCallback(async (activePage, activeSearch, activeStars, activeCategory) => {
    const requestId = ++requestIdRef.current;
    const isInitial = !hasLoadedRef.current;
    if (isInitial) setLoading(true);
    else setFetching(true);

    try {
      const from = (activePage - 1) * pageSize;
      const to = from + pageSize - 1;
      const term = activeSearch?.trim();

      let query = supabase
        .from('content_ratings')
        .select(SELECT, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all' && RATING_TYPES.includes(activeCategory)) {
        query = query.eq('item_type', activeCategory);
      }

      if (activeStars !== 'all') {
        query = query.eq('rating', Number(activeStars));
      }

      if (term) {
        if (/^[1-5]$/.test(term)) {
          query = query.eq('rating', Number(term));
        } else {
          const matches = await searchItemIds(term, activeCategory);
          if (matches.length === 0) {
            if (requestId !== requestIdRef.current) return;
            setItems([]);
            setTotal(0);
            setError(null);
            hasLoadedRef.current = true;
            return;
          }

          const heritageIds = matches.filter((m) => m.item_type === 'heritage').map((m) => m.item_id);
          const eventIds = matches.filter((m) => m.item_type === 'event').map((m) => m.item_id);
          const investmentIds = matches.filter((m) => m.item_type === 'investment').map((m) => m.item_id);

          const parts = [];
          if (heritageIds.length) parts.push(`and(item_type.eq.heritage,item_id.in.(${heritageIds.join(',')}))`);
          if (eventIds.length) parts.push(`and(item_type.eq.event,item_id.in.(${eventIds.join(',')}))`);
          if (investmentIds.length) parts.push(`and(item_type.eq.investment,item_id.in.(${investmentIds.join(',')}))`);
          query = query.or(parts.join(','));
        }
      }

      const { data, count, error: queryError } = await query.range(from, to);
      if (requestId !== requestIdRef.current) return;

      if (queryError) {
        setError(queryError.message);
        setItems([]);
        setTotal(0);
      } else {
        setError(null);
        setItems(await enrichRatings(data ?? []));
        setTotal(count ?? 0);
        hasLoadedRef.current = true;
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setFetching(false);
      }
    }
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    fetchPage(page, debouncedSearch, stars, category);
  }, [page, debouncedSearch, stars, category, fetchPage]);

  const reload = useCallback(() => {
    fetchPage(page, debouncedSearch, stars, category);
  }, [page, debouncedSearch, stars, category, fetchPage]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    totalPages,
    loading,
    fetching,
    error,
    reload,
  };
}
