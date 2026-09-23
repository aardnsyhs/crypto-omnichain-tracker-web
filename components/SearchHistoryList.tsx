'use client';

import React, { useMemo } from 'react';
import type { HistoryItem, SupportedChain } from '../lib/api-types';
import { truncateHashOrAddress, formatTimestamp } from '../lib/validation';

interface SearchHistoryListProps {
  history: HistoryItem[];
  isLoading: boolean;
  onSelect: (chain: SupportedChain, transactionHash: string) => void;
}

export function SearchHistoryList({ history, isLoading, onSelect }: SearchHistoryListProps) {
  // Deduplicate history items by chain + transactionHash, preserving the most recent record
  const dedupedHistory = useMemo(() => {
    const seen = new Set<string>();
    const result: HistoryItem[] = [];

    for (const item of history) {
      const key = `${item.chain.toLowerCase()}:${item.transactionHash.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }, [history]);

  const getStatusBadge = (item: HistoryItem) => {
    if (item.outcome !== 'success') {
      switch (item.outcome) {
        case 'not_found':
          return (
            <span className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
              Not Found
            </span>
          );
        case 'rate_limited':
          return (
            <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-rose-400">
              Rate Limited
            </span>
          );
        default:
          return (
            <span className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
              {item.outcome}
            </span>
          );
      }
    }

    // Lookup succeeded -> show blockchain execution status
    switch (item.txStatus) {
      case 'confirmed':
        return (
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-rose-400">
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-400">
            Pending
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-400">
            Unknown
          </span>
        );
    }
  };

  const getChainBadge = (chain: string) => {
    const chainMap: Record<string, string> = {
      ethereum: 'ETH',
      bsc: 'BNB',
      polygon: 'POL',
    };
    const symbol = chainMap[chain.toLowerCase()] || chain.toUpperCase();
    return (
      <span className="inline-flex items-center rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-300">
        {symbol}
      </span>
    );
  };

  return (
    <section className="w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
        <h2 className="text-xs font-sans uppercase tracking-wider text-zinc-400 font-semibold">Recent searches</h2>
        <span className="font-mono text-xs text-zinc-500">
          {dedupedHistory.length} {dedupedHistory.length === 1 ? 'transaction' : 'transactions'}
          {history.length > dedupedHistory.length && (
            <span className="text-zinc-600 ml-1">({history.length} searches)</span>
          )}
        </span>
      </div>

      {isLoading && dedupedHistory.length === 0 ? (
        <div className="py-8 text-center font-sans text-xs text-zinc-500 animate-pulse">
          Loading search history...
        </div>
      ) : dedupedHistory.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-sans text-xs text-zinc-400">
            No transactions searched yet in this session.
          </p>
          <p className="mt-1 font-sans text-[11px] text-zinc-600">
            Searches performed will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/40">
          {dedupedHistory.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2.5 px-3.5 py-3 transition hover:bg-zinc-800/30 sm:px-5 sm:flex-row sm:items-center sm:justify-between min-w-0"
            >
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                {getChainBadge(item.chain)}
                <span className="font-mono text-xs text-zinc-200 truncate min-w-0" title={item.transactionHash}>
                  {truncateHashOrAddress(item.transactionHash, 6, 4)}
                </span>
                {getStatusBadge(item)}
                {item.cacheHit && (
                  <span
                    title="Served from Redis cache"
                    className="inline-flex shrink-0 items-center rounded bg-emerald-500/10 px-1.5 py-0.5 font-sans text-[10px] text-emerald-400"
                  >
                    cache
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end min-w-0">
                <span className="font-mono text-[11px] text-zinc-500 truncate" title={item.searchedAt}>
                  {formatTimestamp(item.searchedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(item.chain as SupportedChain, item.transactionHash)}
                  className="shrink-0 rounded-md border border-zinc-700/80 bg-zinc-800 px-2.5 py-1 font-sans text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                >
                  Search again
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
