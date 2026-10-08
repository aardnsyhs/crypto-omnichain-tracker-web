'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { SupportedChain, TransactionLookupResponse, HistoryItem } from '../lib/api-types';
import { ApiClientError } from '../lib/api-errors';
import { createApiClient, isIntentionalCancellation } from '../lib/api-client';
import { ACTIVE_CHAINS } from '../lib/network-registry';
import { isValidChain, isValidTransactionHash } from '../lib/validation';
import { TransactionSearchForm } from '../components/TransactionSearchForm';
import { MarketNetworkOverview } from '../components/MarketNetworkOverview';
import { TransactionResultCard } from '../components/TransactionResultCard';
import { LoadingState } from '../components/LoadingState';
import { LookupErrorState } from '../components/LookupErrorState';
import { SearchHistoryList } from '../components/SearchHistoryList';

export default function HomePage() {
  const apiClient = useMemo(() => createApiClient(), []);

  const [selectedChain, setSelectedChain] = useState<SupportedChain>('ethereum');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TransactionLookupResponse | null>(null);
  const [error, setError] = useState<ApiClientError | Error | null>(null);
  const [isFormCondensed, setIsFormCondensed] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const lookupController = useRef<AbortController | null>(null);

  // Monotonic search counter to prevent out-of-order race conditions
  const latestSearchIdRef = useRef<number>(0);

  // Fetch session search history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiClient.getHistory(20);
      setHistory(res.data);
      setHistoryError(null);
    } catch {
      setHistoryError('Search history could not be loaded. Retry to check this session.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, [apiClient]);

  // Execute lookup with race-condition handling
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const executeLookup = useCallback(
    async (chain: SupportedChain, hash: string, isRefresh = false) => {
      const searchId = ++latestSearchIdRef.current;
      lookupController.current?.abort();
      const controller = new AbortController();
      lookupController.current = controller;

      setSelectedChain(chain);
      setTransactionHash(hash);
      if (isRefresh) {
        setIsRetrying(true);
      } else {
        setIsLoading(true);
        setError(null);
        setResult(null);
        setIsFormCondensed(false);
      }

      // Sync URL search params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('chain', chain);
        url.searchParams.set('tx', hash);
        window.history.replaceState({}, '', url.toString());
      }

      try {
        const response = await apiClient.lookupTransaction(
          {
            chain,
            transactionHash: hash,
            refresh: isRefresh,
          },
          controller.signal,
        );

        // Discard result if a newer search was initiated
        if (searchId !== latestSearchIdRef.current) {
          return;
        }

        setResult(response);
        setIsFormCondensed(true);
        setError(null);
      } catch (err) {
        if (isIntentionalCancellation(err)) return;
        if (searchId !== latestSearchIdRef.current) {
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (searchId === latestSearchIdRef.current) {
          setIsLoading(false);
          setIsRetrying(false);
        }
        // Refresh session history to reflect current lookup
        if (!controller.signal.aborted) void fetchHistory();
      }
    },
    [apiClient, fetchHistory],
  );

  const handleRetryMissingData = useCallback(() => {
    if (selectedChain && transactionHash && !isRetrying) {
      void executeLookup(selectedChain, transactionHash, true);
    }
  }, [selectedChain, transactionHash, isRetrying, executeLookup]);

  // Initial mount: load history and check URL params for deep-linked lookups
  useEffect(() => {
    let ignore = false;

    apiClient
      .getHistory(20)
      .then((res) => {
        if (!ignore) {
          setHistory(res.data);
          setHistoryError(null);
          setIsHistoryLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setHistoryError('Search history could not be loaded. Retry to check this session.');
          setIsHistoryLoading(false);
        }
      });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chainParam = params.get('chain');
      const txParam = params.get('tx') || params.get('hash');

      if (
        chainParam &&
        isValidChain(chainParam) &&
        txParam &&
        isValidTransactionHash(txParam, chainParam)
      ) {
        const chain = chainParam as SupportedChain;
        const hash = txParam;
        const searchId = ++latestSearchIdRef.current;
        const controller = new AbortController();
        lookupController.current = controller;
        queueMicrotask(() => {
          if (!ignore) {
            setSelectedChain(chain);
            setTransactionHash(hash);
            setIsLoading(true);
          }
        });

        apiClient
          .lookupTransaction({ chain, transactionHash: hash }, controller.signal)
          .then((response) => {
            if (!ignore && searchId === latestSearchIdRef.current) {
              setSelectedChain(chain);
              setTransactionHash(hash);
              setResult(response);
              setIsFormCondensed(true);
              setError(null);
              setIsLoading(false);
              void fetchHistory();
            }
          })
          .catch((err: unknown) => {
            if (isIntentionalCancellation(err)) return;
            if (!ignore && searchId === latestSearchIdRef.current) {
              setSelectedChain(chain);
              setTransactionHash(hash);
              setError(err instanceof Error ? err : new Error(String(err)));
              setIsLoading(false);
              void fetchHistory();
            }
          });
      }
    }

    return () => {
      ignore = true;
      lookupController.current?.abort();
    };
  }, [apiClient, fetchHistory]);

  return (
    <main className="relative min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/25 selection:text-emerald-200">
      {/* Ambient background depth */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(16,185,129,0.06),transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header: Compact forensic hero, hidden when an active result is displayed */}
        {!result && (
          <header className="flex flex-col items-center text-center pt-2 sm:pt-4">
            <div className="mb-3 inline-flex max-w-full flex-wrap justify-center items-center gap-2 rounded-full border border-border/80 bg-surface-elevated/80 px-3.5 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span className="font-sans font-medium text-foreground">Investigative Ledger</span>
              <span className="h-3 w-px bg-border/80" />
              <span className="font-mono text-[11px] text-muted-foreground">
                {ACTIVE_CHAINS.length} networks • EVM decoding & UTXO ledger
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground font-sans">
              Transaction Story Explorer
            </h1>
            <p className="mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
              Inspect a transaction on its network: UTXO inputs and outputs, token transfers, and
              approval allowances across {ACTIVE_CHAINS.length} supported networks.
            </p>
          </header>
        )}

        {/* Search Form */}
        <section aria-label="Transaction Search">
          <TransactionSearchForm
            key={`${selectedChain}:${transactionHash}`}
            initialChain={selectedChain}
            initialHash={transactionHash}
            isLoading={isLoading}
            isCondensed={isFormCondensed && Boolean(result) && !isLoading}
            onToggleCondensed={(condensed) => {
              setIsFormCondensed(condensed);
              if (!condensed) {
                setResult(null);
                setTransactionHash('');
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('chain');
                  url.searchParams.delete('tx');
                  url.searchParams.delete('hash');
                  window.history.replaceState({}, '', url.pathname);
                }
              }
            }}
            onSubmit={(chain, hash) => void executeLookup(chain, hash)}
          />
        </section>

        {/* Market & Network Overview */}
        <MarketNetworkOverview apiClient={apiClient} isVisible={!result} />

        {/* Interactive Lookup State: Loading / Result / Error */}
        <section aria-label="Lookup Results" aria-live="polite" aria-busy={isLoading || isRetrying}>
          {isLoading && <LoadingState />}

          {!isLoading && error && (
            <LookupErrorState
              error={error}
              onRetry={() => void executeLookup(selectedChain, transactionHash, Boolean(result))}
            />
          )}

          {!isLoading && result && (
            <TransactionResultCard
              response={result}
              onRetry={handleRetryMissingData}
              isRetrying={isRetrying}
            />
          )}
        </section>

        {/* Search History */}
        <SearchHistoryList
          history={history}
          isLoading={isHistoryLoading}
          error={historyError}
          onRetry={() => void fetchHistory()}
          onSelect={(chain, hash) => void executeLookup(chain, hash)}
        />

        {/* Footer */}
        <footer className="mt-8 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground font-sans">
          <p>Transaction Story Explorer • Per-network EVM and UTXO transaction lookup</p>
        </footer>
      </div>
    </main>
  );
}
