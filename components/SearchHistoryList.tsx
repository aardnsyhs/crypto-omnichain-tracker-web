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
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-400">
            Success
          </span>
        );
      case 'not_found':
        return (
          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[11px] font-medium text-amber-400">
            Not Found
          </span>
        );
      case 'rate_limited':
        return (
          <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[11px] font-medium text-rose-400">
            Rate Limited
          </span>
        );
      default:
        return (
          <span className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-slate-300">
            {outcome}
          </span>
        );
    }
  };

  const getChainBadge = (chain: string) => {
    const chainMap: Record<string, { label: string; color: string }> = {
      ethereum: { label: 'ETH', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
      bsc: { label: 'BNB', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
      polygon: { label: 'POL', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
    };
    const c = chainMap[chain.toLowerCase()] || {
      label: chain,
      color: 'border-slate-700 text-slate-400 bg-slate-800',
    };
    return (
      <span
        className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold ${c.color}`}
      >
        {c.label}
      </span>
    );
  };

  return (
    <section className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🕒</span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Session Search History
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {history.length} {history.length === 1 ? 'lookup' : 'lookups'}
        </span>
      </div>

      {isLoading && history.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
          Loading session history...
        </div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500">
            No searches recorded in this anonymous session yet.
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Searches performed will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/50">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-3 transition hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-2.5">
                {getChainBadge(item.chain)}
                <span className="font-mono text-xs text-slate-200" title={item.transactionHash}>
                  {truncateHashOrAddress(item.transactionHash, 8, 6)}
                </span>
                {getOutcomeBadge(item.outcome)}
                {item.cacheHit && (
                  <span
                    title="Served from Redis cache"
                    className="inline-flex items-center text-[11px] text-emerald-400"
                  >
                    ⚡
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-[11px] text-slate-500" title={item.searchedAt}>
                  {formatTimestamp(item.searchedAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelect(item.chain as SupportedChain, item.transactionHash)}
                  className="rounded border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 hover:text-white"
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
