'use client';

import React from 'react';
import type { HistoryItem, SupportedChain } from '../lib/api-types';
import { truncateHashOrAddress, formatTimestamp } from '../lib/validation';

interface SearchHistoryListProps {
  history: HistoryItem[];
  isLoading: boolean;
  onSelect: (chain: SupportedChain, transactionHash: string) => void;
}

export function SearchHistoryList({ history, isLoading, onSelect }: SearchHistoryListProps) {
  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return (
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
            Success
          </span>
        );
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
            {outcome}
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
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-500">Recent Lookups</h2>
        <span className="font-mono text-xs text-zinc-500">
          {history.length} {history.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {isLoading && history.length === 0 ? (
        <div className="py-8 text-center font-mono text-xs text-zinc-500 animate-pulse">
          Loading history records...
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-mono text-xs text-zinc-500">
            No transactions queried in this session.
          </p>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
            Searches performed will automatically record here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/40">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 px-5 py-3 transition hover:bg-zinc-800/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                {getChainBadge(item.chain)}
                <span className="font-mono text-xs text-zinc-200" title={item.transactionHash}>
                  {truncateHashOrAddress(item.transactionHash, 8, 6)}
                </span>
                {getOutcomeBadge(item.outcome)}
                {item.cacheHit && (
                  <span
                    title="Served from Redis cache"
                    className="inline-flex items-center font-mono text-[10px] text-emerald-400"
                  >
                    cached
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="font-mono text-[11px] text-zinc-500" title={item.searchedAt}>
                  {formatTimestamp(item.searchedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(item.chain as SupportedChain, item.transactionHash)}
                  className="rounded-md border border-zinc-700/80 bg-zinc-800 px-2.5 py-1 font-mono text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                >
                  Re-query
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
