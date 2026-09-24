'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  OverviewResponse,
  NetworkOverviewItem,
} from '../lib/api-types';
import { ApiClient } from '../lib/api-client';

interface MarketNetworkOverviewProps {
  apiClient: ApiClient;
  isVisible: boolean;
}

export function formatRelativeTime(timestampSeconds: number | null): string {
  if (timestampSeconds === null || timestampSeconds === undefined) {
    return 'Unavailable';
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, nowSec - timestampSeconds);

  if (diff < 5) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatUsdPrice(price: number | null): string {
  if (price === null || price === undefined || !Number.isFinite(price)) {
    return 'Unavailable';
  }

  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }

  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatChange24h(change: number | null): {
  text: string;
  colorClass: string;
} {
  if (change === null || change === undefined || !Number.isFinite(change)) {
    return { text: 'Unavailable', colorClass: 'text-zinc-500' };
  }

  if (change > 0) {
    return { text: `+${change.toFixed(2)}%`, colorClass: 'text-emerald-400' };
  }

  if (change < 0) {
    return { text: `${change.toFixed(2)}%`, colorClass: 'text-rose-400' };
  }

  return { text: '0.00%', colorClass: 'text-zinc-400' };
}

export function formatGasGwei(gweiStr: string | null): {
  display: string;
  exact: string | null;
} {
  if (!gweiStr || gweiStr === 'null') {
    return { display: 'Unavailable', exact: null };
  }

  const num = Number.parseFloat(gweiStr);
  if (!Number.isFinite(num)) {
    return { display: 'Unavailable', exact: null };
  }

  if (num === 0) {
    return { display: '0 Gwei', exact: '0 Gwei' };
  }

  if (num > 0 && num < 0.01) {
    return { display: '< 0.01 Gwei', exact: `${gweiStr} Gwei` };
  }

  return {
    display: `${num.toFixed(2)} Gwei`,
    exact: `${gweiStr} Gwei`,
  };
}

export function MarketNetworkOverview({ apiClient, isVisible }: MarketNetworkOverviewProps) {
  const [data, setData] = useState<NetworkOverviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const fetchOverview = useCallback(
    async (isManualRefresh = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      try {
        const response: OverviewResponse = await apiClient.getOverview();
        if (isMountedRef.current) {
          setData(response.data);
          setLastFetchedAt(response.meta.fetchedAt);
          setFetchError(null);
        }
      } catch {
        if (isMountedRef.current) {
          setFetchError('Overview is temporarily unavailable. Please try again.');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
        isFetchingRef.current = false;
      }
    },
    [apiClient],
  );

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    void fetchOverview();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOverview]);

  // Periodic polling every 45s (only when visible and tab active)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isVisible) {
        void fetchOverview(false);
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isVisible) {
        void fetchOverview(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVisible, fetchOverview]);

  // When result is active, component is completely hidden to keep focus on ledger
  if (!isVisible) {
    return null;
  }

  return (
    <section
      aria-label="Market and Network Overview"
      className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5"
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 pb-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 font-sans">
            Market & network overview
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Live native coin prices, 24h momentum, latest blocks, and suggested gas prices across chains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastFetchedAt && (
            <span className="text-xs text-zinc-400 font-mono" title={lastFetchedAt}>
              Updated {new Date(lastFetchedAt).toLocaleTimeString()}
            </span>
          )}

          <button
            type="button"
            onClick={() => void fetchOverview(true)}
            disabled={isRefreshing || isLoading}
            aria-label="Refresh market and network overview"
            className="inline-flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Global Fetch Error Banner */}
      {fetchError && !data.length && (
        <div className="mt-4 rounded border border-rose-900/50 bg-rose-950/20 p-3 text-xs text-rose-300">
          <p className="font-medium">Overview temporarily unavailable</p>
          <p className="mt-0.5 text-rose-400/80">{fetchError}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !data.length && (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label="Loading overview data">
          <div className="hidden md:block">
            <div className="h-10 w-full animate-pulse rounded bg-zinc-900/60" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-zinc-900/40" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-zinc-900/40" />
            <div className="mt-2 h-12 w-full animate-pulse rounded bg-zinc-900/40" />
          </div>
          <div className="space-y-3 md:hidden">
            <div className="h-28 w-full animate-pulse rounded border border-zinc-900 bg-zinc-900/40" />
            <div className="h-28 w-full animate-pulse rounded border border-zinc-900 bg-zinc-900/40" />
            <div className="h-28 w-full animate-pulse rounded border border-zinc-900 bg-zinc-900/40" />
          </div>
        </div>
      )}

      {/* Loaded State */}
      {Boolean(data.length) && (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="mt-3 hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 font-sans">
                  <th scope="col" className="py-2.5 pr-4 font-medium">
                    Network
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">
                    Price (USD)
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">
                    24h Change
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">
                    Latest Block
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">
                    Block Time
                  </th>
                  <th scope="col" className="py-2.5 px-4 font-medium text-right">
                    Suggested Gas
                  </th>
                  <th scope="col" className="py-2.5 pl-4 font-medium text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {data.map((item) => {
                  const change = formatChange24h(item.market?.change24h ?? null);
                  const gas = formatGasGwei(item.network?.suggestedGasPriceGwei ?? null);

                  return (
                    <tr
                      key={item.chain}
                      className="transition-colors hover:bg-zinc-900/30"
                    >
                      {/* Network & Symbol */}
                      <td className="py-3 pr-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-200">
                            {item.name}
                          </span>
                          <span className="rounded bg-zinc-850 px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-400">
                            {item.nativeSymbol}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                          Source: {item.market?.source || 'Unavailable'} / {item.network?.source || 'Unavailable'}
                        </div>
                      </td>

                      {/* Native Coin Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-100">
                        {formatUsdPrice(item.market?.priceUsd ?? null)}
                      </td>

                      {/* 24h Change */}
                      <td
                        className={`py-3 px-4 text-right font-mono tabular-nums font-medium ${change.colorClass}`}
                      >
                        {change.text}
                      </td>

                      {/* Latest Block */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-200">
                        {item.network?.latestBlockNumber !== null &&
                        item.network?.latestBlockNumber !== undefined
                          ? `#${item.network.latestBlockNumber.toLocaleString('en-US')}`
                          : 'Unavailable'}
                      </td>

                      {/* Block Timestamp */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-400">
                        {formatRelativeTime(item.network?.latestBlockTimestamp ?? null)}
                      </td>

                      {/* Suggested Gas Price */}
                      <td
                        className="py-3 px-4 text-right font-mono tabular-nums text-zinc-300"
                        title={gas.exact ? `Exact: ${gas.exact}` : undefined}
                      >
                        {gas.display}
                      </td>

                      {/* Status Badges */}
                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.market?.isStale && (
                            <span className="rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-800/40">
                              Stale Market
                            </span>
                          )}
                          {item.network?.isStale && (
                            <span className="rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-800/40">
                              Stale Node
                            </span>
                          )}
                          {item.market?.status === 'rate_limited' && (
                            <span className="rounded bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                              Rate Limited
                            </span>
                          )}
                          {item.network?.status === 'unavailable' && (
                            <span className="rounded bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                              Unavailable
                            </span>
                          )}
                          {!item.market?.isStale &&
                            !item.network?.isStale &&
                            item.market?.status === 'available' &&
                            item.network?.status === 'available' && (
                              <span className="text-[11px] font-medium text-emerald-400 font-sans">
                                Live
                              </span>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="mt-3 space-y-3 md:hidden">
            {data.map((item) => {
              const change = formatChange24h(item.market?.change24h ?? null);
              const gas = formatGasGwei(item.network?.suggestedGasPriceGwei ?? null);

              return (
                <div
                  key={item.chain}
                  className="rounded border border-zinc-850 bg-zinc-900/40 p-3.5"
                >
                  {/* Card Header: Network Name + Symbol + Status */}
                  <div className="flex items-center justify-between border-b border-zinc-850/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100 font-sans">
                        {item.name}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-400">
                        {item.nativeSymbol}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.market?.isStale && (
                        <span className="rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-800/40">
                          Stale Market
                        </span>
                      )}
                      {item.network?.isStale && (
                        <span className="rounded bg-amber-950/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-800/40">
                          Stale Node
                        </span>
                      )}
                      {item.network?.status === 'unavailable' && (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                          Unavailable
                        </span>
                      )}
                      {!item.market?.isStale &&
                        !item.network?.isStale &&
                        item.market?.status === 'available' &&
                        item.network?.status === 'available' && (
                          <span className="text-[11px] font-medium text-emerald-400 font-sans">
                            Live
                          </span>
                        )}
                    </div>
                  </div>

                  {/* 2-Column Metrics Grid */}
                  <div className="mt-2.5 grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-400 font-sans block">
                        Native Price
                      </span>
                      <span className="font-mono tabular-nums font-medium text-zinc-100 text-sm">
                        {formatUsdPrice(item.market?.priceUsd ?? null)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 font-sans block">
                        24h Change
                      </span>
                      <span
                        className={`font-mono tabular-nums font-medium text-sm ${change.colorClass}`}
                      >
                        {change.text}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 font-sans block">
                        Latest Block
                      </span>
                      <span className="font-mono tabular-nums text-zinc-200">
                        {item.network?.latestBlockNumber !== null &&
                        item.network?.latestBlockNumber !== undefined
                          ? `#${item.network.latestBlockNumber.toLocaleString('en-US')}`
                          : 'Unavailable'}
                      </span>
                      {item.network?.latestBlockTimestamp && (
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          {formatRelativeTime(item.network.latestBlockTimestamp)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 font-sans block">
                        Suggested Gas
                      </span>
                      <span className="font-mono tabular-nums text-zinc-200">
                        {gas.display}
                      </span>
                      {gas.exact && (
                        <span className="text-[10px] text-zinc-400 font-mono block truncate" title={gas.exact}>
                          {gas.exact}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mobile Source Info Footer (visible without hover) */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-850/60 flex flex-wrap items-center justify-between text-[10px] text-zinc-400 font-sans">
                    <span>
                      Market: {item.market?.source || 'Unavailable'}
                      {item.market?.updatedAt && ` (${new Date(item.market.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                    </span>
                    <span>
                      Node: {item.network?.source || 'Unavailable'}
                      {item.network?.updatedAt && ` (${new Date(item.network.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Footnote */}
          <div className="mt-3 hidden md:flex items-center justify-between text-[11px] text-zinc-400 font-sans border-t border-zinc-900 pt-2.5">
            <p>
              Sources: Blockchair (Ethereum stats), CoinGecko (market quotes), EVM RPC (network blocks and gas).
            </p>
            <p className="text-zinc-400">
              Suggested by the data provider. Actual transaction fees depend on gas used and fee settings.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
