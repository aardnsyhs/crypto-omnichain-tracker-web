'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);

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

  // Execute lookup
  const executeLookup = useCallback(
    async (chain: SupportedChain, hash: string) => {
      setSelectedChain(chain);
      setTransactionHash(hash);
      setIsLoading(true);
      setError(null);
      setResult(null);

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
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
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
    <main className="min-h-screen bg-[#0b0f19] px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        {/* Header Branding */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xl shadow-lg shadow-indigo-500/10">
              ⚡
            </span>
            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              Omnichain Tracker MVP
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Crypto Omnichain Transaction Tracker
          </h1>
          <p className="mt-2.5 max-w-xl text-sm text-slate-400 leading-relaxed">
            Fast, unified EVM transaction lookups across Ethereum, BNB Smart Chain, and Polygon with
            resilient Redis cache-aside and real-time validation.
          </p>
        </header>

        {/* Search Form */}
        <section aria-label="Transaction Search">
          <TransactionSearchForm
            initialChain={selectedChain}
            initialHash={transactionHash}
            isLoading={isLoading}
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
        <footer className="mt-4 border-t border-slate-800/80 pt-6 text-center text-xs text-slate-500">
          <p>
            Crypto Omnichain Transaction Tracker • Built with Next.js App Router, Tailwind CSS, and
            NestJS API.
          </p>
        </footer>
      </div>
    </main>
  );
}
