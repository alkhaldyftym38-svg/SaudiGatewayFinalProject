import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { withTimeout } from '../lib/queryTimeout';

const SEARCH_DEBOUNCE_MS = 350;

function buildOrSearch(columns, term) {
  const pattern = `%${term}%`;
  return columns.map(col => `${col}.ilike.${pattern}`).join(',');
}

function applyFilters(query, table, filters, debouncedSearch, searchColumns) {
  if (filters.category && filters.category !== 'all') {
    query = filters.category === 'UNESCO'
      ? query.eq('category', 'UNESCO')
      : query.ilike('category', filters.category);
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.permit === 'yes') query = query.eq('permit_required', true);
  if (filters.permit === 'no') query = query.eq('permit_required', false);
  if (filters.isFree) query = query.eq('is_free', true);

  if (table === 'profiles') {
    if (filters.userRole && filters.userRole !== 'all') {
      query = query.eq('role', filters.userRole);
    }
    if (!filters.includeDeleted) {
      query = query.is('deleted_at', null);
    }
    if (filters.accountStatus === 'blocked') {
      query = query.eq('is_blocked', true);
    } else if (filters.accountStatus === 'active') {
      query = query.eq('is_blocked', false);
    }
  }

  if (table === 'support_messages' && filters.messageStatus && filters.messageStatus !== 'all') {
    query = query.eq('status', filters.messageStatus);
  }

  const term = debouncedSearch?.trim();
  if (term && searchColumns.length > 0) {
    query = query.or(buildOrSearch(searchColumns, term));
  }
  return query;
}

export function usePaginatedList({
  table,
  pageSize = 9,
  order = { column: 'created_at', ascending: false },
  filters = {},
  searchColumns = [],
  select = '*',
}) {
  const { tabResumeCount } = useApp();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? '');
  const [fetchTick, setFetchTick] = useState(0);
  const prevFilterKeyRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const lastResumeCountRef = useRef(0);

  const searchColumnsKey = searchColumns.join(',');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search ?? ''), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const filterKey = useMemo(
    () => JSON.stringify({
      category: filters.category,
      status: filters.status,
      permit: filters.permit,
      isFree: filters.isFree,
      userRole: filters.userRole,
      accountStatus: filters.accountStatus,
      includeDeleted: filters.includeDeleted,
      messageStatus: filters.messageStatus,
      search: debouncedSearch,
      order: `${order.column}:${order.ascending}`,
    }),
    [filters.category, filters.status, filters.permit, filters.isFree, filters.userRole, filters.accountStatus, filters.includeDeleted, filters.messageStatus, debouncedSearch, order.column, order.ascending],
  );

  useEffect(() => {
    if (tabResumeCount > 0 && tabResumeCount !== lastResumeCountRef.current) {
      lastResumeCountRef.current = tabResumeCount;
      setFetchTick((t) => t + 1);
    }
  }, [tabResumeCount]);

  useEffect(() => {
    const filterChanged = prevFilterKeyRef.current !== null && prevFilterKeyRef.current !== filterKey;

    if (filterChanged && page !== 1) {
      prevFilterKeyRef.current = filterKey;
      setPage(1);
      return;
    }

    prevFilterKeyRef.current = filterKey;
    const requestId = ++requestIdRef.current;
    const activePage = page;

    (async () => {
      const isInitial = !hasLoadedRef.current;
      if (isInitial) setLoading(true);
      else setFetching(true);

      try {
        const from = (activePage - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase.from(table).select(select, { count: 'exact' });
        query = applyFilters(query, table, filters, debouncedSearch, searchColumns);
        query = query.order(order.column, { ascending: order.ascending }).range(from, to);

        const { data, count, error: queryError } = await withTimeout(query);
        if (requestId !== requestIdRef.current) return;

        if (queryError) {
          setError(queryError.message);
          setItems([]);
          setTotal(0);
        } else {
          setError(null);
          setItems(data ?? []);
          setTotal(count ?? 0);
          hasLoadedRef.current = true;
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err?.message === 'request_timeout' ? 'Request timed out' : (err?.message || 'Failed to load'));
        setItems([]);
        setTotal(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setFetching(false);
        }
      }
    })();

    return () => {
      requestIdRef.current += 1;
    };
  }, [table, page, pageSize, filterKey, select, searchColumnsKey, fetchTick]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setFetching(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase.from(table).select(select, { count: 'exact' });
      query = applyFilters(query, table, filters, debouncedSearch, searchColumns);
      query = query.order(order.column, { ascending: order.ascending }).range(from, to);
      const { data, count, error: err } = await withTimeout(query);
      if (requestId !== requestIdRef.current) return;
      if (!err) {
        setItems(data ?? []);
        setTotal(count ?? 0);
        setError(null);
        hasLoadedRef.current = true;
      }
    } finally {
      if (requestId === requestIdRef.current) setFetching(false);
    }
  }, [
    table,
    page,
    pageSize,
    order.column,
    order.ascending,
    select,
    filters,
    debouncedSearch,
    searchColumns,
  ]);

  const ensureItemVisible = useCallback(async (id) => {
    if (!id) return;
    const { data } = await supabase.from(table).select(select).eq('id', id).maybeSingle();
    if (data) {
      setItems(prev => (prev.some(item => item.id === id) ? prev : [data, ...prev]));
    }
  }, [table, select]);

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
    ensureItemVisible,
  };
}
