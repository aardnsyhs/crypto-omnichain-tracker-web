'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { SupportedChain, TransactionLookupResponse, HistoryItem } from '../lib/api-types';
import { ApiClientError } from '../lib/api-errors';
import { createApiClient } from '../lib/api-client';
import { isValidChain, isValidTransactionHash } from '../lib/validation';
import { TransactionSearchForm } from '../components/TransactionSearchForm';
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
    <main className="min-h-screen bg-black px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* Header Branding */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/60 px-3 py-1 font-mono text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Omnichain Transaction Story Explorer</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500">v1.1</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Transaction Story
          </h1>
          <p className="mt-2 max-w-lg text-sm text-zinc-400 leading-relaxed">
            Understand transaction intent, token movements, and approval allowances across Ethereum,
            BNB Smart Chain, and Polygon with verified EVM decoding.
          </p>
        </header>

        {/* Search Form */}
        <section aria-label="Transaction Search">
          <TransactionSearchForm
            initialChain={selectedChain}
            initialHash={transactionHash}
            isLoading={isLoading}
            isCondensed={isFormCondensed && Boolean(result) && !isLoading}
            onToggleCondensed={setIsFormCondensed}
            onSubmit={(chain, hash) => void executeLookup(chain, hash)}
          />
        </section>

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

        {/* Footer */}
        <footer className="mt-6 border-t border-zinc-900 pt-6 text-center font-mono text-[11px] text-zinc-600">
          <p>Omnichain Transaction Story Explorer • Next.js & Tailwind CSS • Low Latency Cache</p>
        </footer>
      </div>
    </main>
  );
}
