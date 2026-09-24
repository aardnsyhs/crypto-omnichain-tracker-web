'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { SupportedChain, TransactionLookupResponse, HistoryItem } from '../lib/api-types';
import { ApiClientError } from '../lib/api-errors';
import { createApiClient } from '../lib/api-client';
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

  // Monotonic search counter to prevent out-of-order race conditions
  const latestSearchIdRef = useRef<number>(0);

  // Fetch session search history
  const fetchHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      const res = await apiClient.getHistory(20);
      setHistory(res.data);
    } catch {
      // Degrade gracefully if history cannot be loaded
    } finally {
      setIsHistoryLoading(false);
    }
  }, [apiClient]);

  // Execute lookup with race-condition handling
  const executeLookup = useCallback(
    async (chain: SupportedChain, hash: string) => {
      const searchId = ++latestSearchIdRef.current;

      setSelectedChain(chain);
      setTransactionHash(hash);
      setIsLoading(true);
      setError(null);
      setResult(null);
      setIsFormCondensed(false);

      // Sync URL search params
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('chain', chain);
        url.searchParams.set('tx', hash);
        window.history.replaceState({}, '', url.toString());
      }

      try {
        const response = await apiClient.lookupTransaction({
          chain,
          transactionHash: hash,
        });

        // Discard result if a newer search was initiated
        if (searchId !== latestSearchIdRef.current) {
          return;
        }

        setResult(response);
        setIsFormCondensed(true);
      } catch (err) {
        if (searchId !== latestSearchIdRef.current) {
          return;
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (searchId === latestSearchIdRef.current) {
          setIsLoading(false);
        }
        // Refresh session history to reflect current lookup
        void fetchHistory();
      }
    },
    [apiClient, fetchHistory],
  );

  // Initial mount: load history and check URL params for deep-linked lookups
  useEffect(() => {
    void fetchHistory();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chainParam = params.get('chain');
      const txParam = params.get('tx') || params.get('hash');

      if (chainParam && isValidChain(chainParam) && txParam && isValidTransactionHash(txParam)) {
        void executeLookup(chainParam as SupportedChain, txParam);
      }
    }
  }, [executeLookup, fetchHistory]);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Header: Quiet and hidden when active result is displayed */}
        {!result && (
          <header className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl font-sans">
              Transaction Story Explorer
            </h1>
            <p className="mt-2 max-w-lg text-sm text-zinc-400 leading-relaxed font-sans">
              Investigate transaction intent, token movements, and approval allowances across EVM chains with verified on-chain decoding.
            </p>
          </header>
        )}

        {/* Search Form */}
        <section aria-label="Transaction Search">
          <TransactionSearchForm
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
        <section aria-label="Lookup Results">
          {isLoading && <LoadingState />}

          {!isLoading && error && (
            <LookupErrorState
              error={error}
              onRetry={() => void executeLookup(selectedChain, transactionHash)}
            />
          )}

          {!isLoading && result && <TransactionResultCard response={result} />}
        </section>

        {/* Search History */}
        <SearchHistoryList
          history={history}
          isLoading={isHistoryLoading}
          onSelect={(chain, hash) => void executeLookup(chain, hash)}
        />

        {/* Footer: Quiet ledger audit text without technology marketing */}
        <footer className="mt-8 border-t border-zinc-900/80 pt-6 text-center text-xs text-zinc-500 font-sans">
          <p>Omnichain Transaction Story Explorer • Multi-chain verified EVM ledger</p>
        </footer>
      </div>
    </main>
  );
}
