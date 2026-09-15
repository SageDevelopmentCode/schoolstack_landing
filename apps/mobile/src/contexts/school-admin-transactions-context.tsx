import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  PaymentRecordDisplayRow,
  PaymentStatus,
  PaymentType,
} from '@/lib/admissions/payment-records';
import {
  fetchTransactionsPage,
  type TransactionsPageMeta,
} from '@/lib/school-admin/transactions-api';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

type SchoolAdminTransactionsContextValue = {
  rows: PaymentRecordDisplayRow[];
  meta: TransactionsPageMeta | null;
  totalCount: number;
  statusFilter: '' | PaymentStatus;
  typeFilter: '' | PaymentType;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  hasLoaded: boolean;
  setStatusFilter: (status: '' | PaymentStatus) => void;
  setTypeFilter: (type: '' | PaymentType) => void;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  loadMore: () => Promise<void>;
};

const SchoolAdminTransactionsContext =
  createContext<SchoolAdminTransactionsContextValue | null>(null);

type SchoolAdminTransactionsProviderProps = {
  children: ReactNode;
  organizationId: string;
};

export function SchoolAdminTransactionsProvider({
  children,
  organizationId,
}: SchoolAdminTransactionsProviderProps) {
  const reportError = useMemo(
    () => createSchoolAdminErrorReporter(organizationId),
    [organizationId],
  );

  const [rows, setRows] = useState<PaymentRecordDisplayRow[]>([]);
  const [meta, setMeta] = useState<TransactionsPageMeta | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilterState] = useState<'' | PaymentStatus>('');
  const [typeFilter, setTypeFilterState] = useState<'' | PaymentType>('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const loadMorePromiseRef = useRef<Promise<void> | null>(null);
  const hasLoadedRef = useRef(false);
  const metaRef = useRef<TransactionsPageMeta | null>(null);
  const statusFilterRef = useRef(statusFilter);
  const typeFilterRef = useRef(typeFilter);
  const rowsLengthRef = useRef(0);

  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    typeFilterRef.current = typeFilter;
  }, [typeFilter]);

  useEffect(() => {
    rowsLengthRef.current = rows.length;
  }, [rows.length]);

  const fetchPage = useCallback(
    async ({
      offset,
      includeMeta,
      status,
      paymentType,
    }: {
      offset: number;
      includeMeta?: boolean;
      status?: '' | PaymentStatus;
      paymentType?: '' | PaymentType;
    }) => {
      const response = await fetchTransactionsPage({
        organizationId,
        offset,
        status: status || undefined,
        paymentType: paymentType || undefined,
        includeMeta,
      });

      return response;
    },
    [organizationId],
  );

  const load = useCallback(
    async (options?: {
      refresh?: boolean;
      silent?: boolean;
      status?: '' | PaymentStatus;
      paymentType?: '' | PaymentType;
    }) => {
      const isRefresh = options?.refresh ?? false;
      const silent = options?.silent ?? false;

      if (fetchPromiseRef.current && !isRefresh) {
        await fetchPromiseRef.current;
        return;
      }

      const run = async () => {
        const status = options?.status ?? statusFilterRef.current;
        const paymentType = options?.paymentType ?? typeFilterRef.current;

        if (isRefresh || silent) {
          if (!silent || hasLoadedRef.current) {
            setIsRefreshing(true);
          }
        } else {
          setIsLoading(true);
        }
        setError(null);

        try {
          const body = await fetchPage({
            offset: 0,
            includeMeta: !metaRef.current,
            status,
            paymentType,
          });

          setRows(body.rows);
          setTotalCount(body.totalCount);
          setHasMore(body.hasMore);
          if (body.meta) {
            metaRef.current = body.meta;
            setMeta(body.meta);
          }
          hasLoadedRef.current = true;
          setHasLoaded(true);
        } catch (loadError) {
          reportError('school_admin_transactions_load', loadError);
          setError(
            loadError instanceof Error ? loadError.message : 'Failed to load transactions.',
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
          fetchPromiseRef.current = null;
        }
      };

      const promise = run();
      if (!isRefresh) {
        fetchPromiseRef.current = promise;
      }
      await promise;
    },
    [fetchPage, reportError],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      await load({ refresh: true, silent: options?.silent });
    },
    [load],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) return;
    if (loadMorePromiseRef.current) {
      await loadMorePromiseRef.current;
      return;
    }

    const run = async () => {
      setIsLoadingMore(true);
      setError(null);

      try {
        const body = await fetchPage({
          offset: rowsLengthRef.current,
          status: statusFilterRef.current,
          paymentType: typeFilterRef.current,
        });

        setRows((prev) => [...prev, ...body.rows]);
        setTotalCount(body.totalCount);
        setHasMore(body.hasMore);
      } catch (loadError) {
        reportError('school_admin_transactions_load_more', loadError);
        setError(
          loadError instanceof Error ? loadError.message : 'Failed to load more transactions.',
        );
      } finally {
        setIsLoadingMore(false);
        loadMorePromiseRef.current = null;
      }
    };

    const promise = run();
    loadMorePromiseRef.current = promise;
    await promise;
  }, [fetchPage, hasMore, isLoading, isLoadingMore, isRefreshing, reportError]);

  const setStatusFilter = useCallback(
    (status: '' | PaymentStatus) => {
      setStatusFilterState(status);
      void load({ refresh: true, status, paymentType: typeFilterRef.current });
    },
    [load],
  );

  const setTypeFilter = useCallback(
    (type: '' | PaymentType) => {
      setTypeFilterState(type);
      void load({ refresh: true, status: statusFilterRef.current, paymentType: type });
    },
    [load],
  );

  useEffect(() => {
    void load();
  }, [load, organizationId]);

  const value = useMemo(
    () => ({
      rows,
      meta,
      totalCount,
      statusFilter,
      typeFilter,
      isLoading,
      isRefreshing,
      isLoadingMore,
      hasMore,
      error,
      hasLoaded,
      setStatusFilter,
      setTypeFilter,
      refresh,
      loadMore,
    }),
    [
      error,
      hasLoaded,
      hasMore,
      isLoading,
      isLoadingMore,
      isRefreshing,
      loadMore,
      meta,
      refresh,
      rows,
      setStatusFilter,
      setTypeFilter,
      statusFilter,
      totalCount,
      typeFilter,
    ],
  );

  return (
    <SchoolAdminTransactionsContext.Provider value={value}>
      {children}
    </SchoolAdminTransactionsContext.Provider>
  );
}

export function useSchoolAdminTransactions(): SchoolAdminTransactionsContextValue {
  const context = useContext(SchoolAdminTransactionsContext);
  if (!context) {
    throw new Error(
      'useSchoolAdminTransactions must be used within SchoolAdminTransactionsProvider',
    );
  }
  return context;
}
