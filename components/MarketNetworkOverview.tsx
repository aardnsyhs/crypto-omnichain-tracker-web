'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, RefreshCw, Fuel, Layers, Coins } from 'lucide-react';
import type {
  OverviewResponse,
  NetworkOverviewItem,
} from '../lib/api-types';
import { ApiClient } from '../lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

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

export function formatSourceTimestamp(isoString: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

export function MarketNetworkOverview({ apiClient, isVisible }: MarketNetworkOverviewProps) {
  const [data, setData] = useState<NetworkOverviewItem[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

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
      if (document.visibilityState === 'visible') {
        void fetchOverview();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchOverview, isVisible]);

  // If parent says overview is not visible (e.g. transaction result is active), don't render
  if (!isVisible) {
    return null;
  }

  return (
    <section aria-label="Market and Network Overview">
      <Card className="shadow-xl border-zinc-800/90">
      <CardHeader className="p-4 sm:p-5 border-b border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-indigo-400">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-zinc-100 font-sans flex items-center gap-2">
                <span>Market & network overview</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-sans mt-0.5">
                Live native coin prices, 24h momentum, latest blocks, and suggested gas prices across chains.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastFetchedAt && (
              <span className="font-mono text-[11px] text-zinc-500">
                Updated {new Date(lastFetchedAt).toLocaleTimeString()}
              </span>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void fetchOverview(true)}
              disabled={isRefreshing || isLoading}
              aria-label="Refresh market and network overview"
              className="gap-1.5 font-sans"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
                aria-hidden="true"
              />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-3">
        {/* Global Fetch Error Banner */}
        {fetchError && !data.length && (
          <div className="rounded-lg border border-rose-900/50 bg-rose-950/20 p-3.5 text-xs text-rose-300">
            <p className="font-semibold font-sans">Overview temporarily unavailable</p>
            <p className="mt-0.5 text-rose-400/90 font-sans">{fetchError}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !data.length && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading overview data">
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
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-sans">
                    <th scope="col" className="py-2.5 pr-4 font-semibold">
                      Network
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      Price (USD)
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      24h Change
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      Latest Block
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      Block Time
                    </th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                      Suggested Gas
                    </th>
                    <th scope="col" className="py-2.5 pl-4 font-semibold text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/60">
                  {data.map((item) => {
                    const change = formatChange24h(item.market?.change24h ?? null);
                    const gas = formatGasGwei(item.network?.suggestedGasPriceGwei ?? null);

                    return (
                      <tr
                        key={item.chain}
                        className="transition-colors hover:bg-zinc-850/30"
                      >
                        {/* Network & Symbol */}
                        <td className="py-3 pr-4 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100">
                              {item.name}
                            </span>
                            <span className="rounded bg-zinc-850 px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-400 border border-zinc-750/50">
                              {item.nativeSymbol}
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                            Source: {item.market?.source || 'Unavailable'} / {item.network?.source || 'Unavailable'}
                          </div>
                        </td>

                        {/* Native Coin Price */}
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-zinc-100 font-medium">
                          {formatUsdPrice(item.market?.priceUsd ?? null)}
                        </td>

                        {/* 24h Change */}
                        <td
                          className={cn('py-3 px-4 text-right font-mono tabular-nums font-semibold', change.colorClass)}
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
                              <Badge variant="warning" className="font-sans text-[10px]">
                                Stale Market
                              </Badge>
                            )}
                            {item.network?.isStale && (
                              <Badge variant="warning" className="font-sans text-[10px]">
                                Stale Node
                              </Badge>
                            )}
                            {item.market?.status === 'rate_limited' && (
                              <Badge variant="secondary" className="font-sans text-[10px]">
                                Rate Limited
                              </Badge>
                            )}
                            {item.network?.status === 'unavailable' && (
                              <Badge variant="secondary" className="font-sans text-[10px]">
                                Unavailable
                              </Badge>
                            )}
                            {!item.market?.isStale &&
                              !item.network?.isStale &&
                              item.market?.status === 'available' &&
                              item.network?.status === 'available' && (
                                <span className="text-[11px] font-semibold text-emerald-400 font-sans">
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
            <div className="space-y-3 md:hidden">
              {data.map((item) => {
                const change = formatChange24h(item.market?.change24h ?? null);
                const gas = formatGasGwei(item.network?.suggestedGasPriceGwei ?? null);

                return (
                  <div
                    key={item.chain}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 shadow-sm"
                  >
                    {/* Card Header: Network Name + Symbol + Status */}
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-100 font-sans">
                          {item.name}
                        </span>
                        <span className="rounded bg-zinc-850 px-1.5 py-0.5 text-[11px] font-mono font-medium text-zinc-400 border border-zinc-750/50">
                          {item.nativeSymbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.market?.isStale && (
                          <Badge variant="warning" className="text-[10px]">
                            Stale Market
                          </Badge>
                        )}
                        {item.network?.isStale && (
                          <Badge variant="warning" className="text-[10px]">
                            Stale Node
                          </Badge>
                        )}
                        {item.market?.status === 'rate_limited' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Rate Limited
                          </Badge>
                        )}
                        {item.network?.status === 'unavailable' && (
                          <Badge variant="secondary" className="text-[10px]">
                            Unavailable
                          </Badge>
                        )}
                        {!item.market?.isStale &&
                          !item.network?.isStale &&
                          item.market?.status === 'available' &&
                          item.network?.status === 'available' && (
                            <span className="text-xs font-semibold text-emerald-400 font-sans">
                              Live
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <span className="text-[11px] text-zinc-500 font-sans flex items-center gap-1">
                          <Coins className="h-3 w-3 text-zinc-400" />
                          <span>Native Price</span>
                        </span>
                        <div className="font-mono text-sm font-semibold text-zinc-100 tabular-nums mt-0.5">
                          {formatUsdPrice(item.market?.priceUsd ?? null)}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 font-sans">24h Change</span>
                        <div className={cn('font-mono text-sm font-semibold tabular-nums mt-0.5', change.colorClass)}>
                          {change.text}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 font-sans flex items-center gap-1">
                          <Layers className="h-3 w-3 text-zinc-400" />
                          <span>Latest Block</span>
                        </span>
                        <div className="font-mono text-xs text-zinc-200 tabular-nums mt-0.5">
                          {item.network?.latestBlockNumber !== null &&
                          item.network?.latestBlockNumber !== undefined
                            ? `#${item.network.latestBlockNumber.toLocaleString('en-US')}`
                            : 'Unavailable'}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {formatRelativeTime(item.network?.latestBlockTimestamp ?? null)}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 font-sans flex items-center gap-1">
                          <Fuel className="h-3 w-3 text-zinc-400" />
                          <span>Suggested Gas</span>
                        </span>
                        <div className="font-mono text-xs text-zinc-200 tabular-nums mt-0.5">
                          {gas.display}
                        </div>
                        {gas.exact && gas.exact !== gas.display && (
                          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px] mt-0.5">
                            {gas.exact}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Source and Timestamps */}
                    <div className="mt-3 border-t border-zinc-850/80 pt-2 text-[10px] text-zinc-500 font-sans space-y-0.5">
                      <div>
                        Market: {item.market?.source || 'Unavailable'}
                        {item.market?.updatedAt && ` (${formatSourceTimestamp(item.market.updatedAt)})`}
                      </div>
                      <div>
                        Node: {item.network?.source || 'Unavailable'}
                        {item.network?.updatedAt && ` (${formatSourceTimestamp(item.network.updatedAt)})`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory Note & Source Attribution */}
            <div className="mt-4 border-t border-zinc-850/80 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-zinc-500 font-sans">
              <div>
                Sources: Blockchair (Ethereum stats), CoinGecko (market quotes), EVM RPC (network blocks and gas).
              </div>
              <div className="text-zinc-500">
                Suggested by the data provider. Actual transaction fees depend on gas used and fee settings.
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </section>
  );
}
