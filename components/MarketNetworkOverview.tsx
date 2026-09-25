'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  RefreshCw,
  Fuel,
  Layers,
  Coins,
  TrendingUp,
  TrendingDown,
  Clock3,
} from 'lucide-react';
import type { OverviewResponse, NetworkOverviewItem } from '../lib/api-types';
import { ApiClient } from '../lib/api-client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
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
    return { text: 'Unavailable', colorClass: 'text-muted-foreground' };
  }

  if (change > 0) {
    return { text: `+${change.toFixed(2)}%`, colorClass: 'text-emerald-400' };
  }

  if (change < 0) {
    return { text: `${change.toFixed(2)}%`, colorClass: 'text-rose-400' };
  }

  return { text: '0.00%', colorClass: 'text-muted-foreground' };
}

export function formatGasGwei(
  gweiStr: string | null,
  gasNote?: string | null,
): {
  display: string;
  exact: string | null;
  note: string | null;
} {
  if (!gweiStr || gweiStr === 'null') {
    return { display: 'Unavailable', exact: null, note: null };
  }

  const num = Number.parseFloat(gweiStr);
  if (!Number.isFinite(num)) {
    return { display: 'Unavailable', exact: null, note: null };
  }

  if (num === 0) {
    return {
      display: '0 Gwei (est.)',
      exact: '0 Gwei',
      note: gasNote || 'Provider estimated 0 Gwei under low congestion',
    };
  }

  if (num > 0 && num < 0.01) {
    return { display: '< 0.01 Gwei', exact: `${gweiStr} Gwei`, note: null };
  }

  return {
    display: `${num.toFixed(2)} Gwei`,
    exact: `${gweiStr} Gwei`,
    note: null,
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

const NETWORK_TICKER_CLASSES: Record<string, string> = {
  ethereum: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
  bsc: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  polygon: 'border-violet-500/30 bg-violet-950/40 text-violet-300',
};

export function MarketNetworkOverview({ apiClient, isVisible }: MarketNetworkOverviewProps) {
  const [data, setData] = useState<NetworkOverviewItem[]>([]);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  const loadOverview = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

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
  }, [apiClient]);

  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadOverview();
  }, [loadOverview]);

  // Initial load
  useEffect(() => {
    let ignore = false;

    apiClient
      .getOverview()
      .then((response: OverviewResponse) => {
        if (!ignore) {
          setData(response.data);
          setLastFetchedAt(response.meta.fetchedAt);
          setFetchError(null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setFetchError('Overview is temporarily unavailable. Please try again.');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [apiClient]);

  // Periodic polling every 45s (only when visible and tab active)
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadOverview();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [loadOverview, isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <section aria-label="Market and Network Overview">
      <Card className="border-border/80 bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="p-4 sm:p-5 border-b border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-surface-nested text-emerald-400 shadow-inner">
                <Activity className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
                  <span>Market & network overview</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Live native coin quotes, 24h momentum, latest block heights, and network gas
                  estimates from official Blockchair stats API.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastFetchedAt && (
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  <span>Updated {new Date(lastFetchedAt).toLocaleTimeString()}</span>
                </div>
              )}

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleManualRefresh}
                      disabled={isRefreshing || isLoading}
                      aria-label="Refresh market and network overview"
                      className="gap-1.5 font-sans"
                    >
                      <RefreshCw
                        className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
                        aria-hidden="true"
                      />
                      <span className="hidden sm:inline">
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                      </span>
                    </Button>
                  }
                />
                <TooltipContent>Refresh live quotes and node status</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-4.5 pt-3 sm:pt-3.5">
          {/* Error Banner */}
          {fetchError && !data.length && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-rose-300">
              <p className="font-semibold font-sans">Overview temporarily unavailable</p>
              <p className="mt-0.5 text-rose-300/80 font-sans">{fetchError}</p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && !data.length && (
            <div className="space-y-2.5" aria-busy="true" aria-label="Loading overview data">
              <div className="hidden md:block space-y-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div className="space-y-2.5 md:hidden">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          )}

          {/* Loaded Content */}
          {Boolean(data.length) && (
            <>
              {/* Desktop Table View (>= 768px) - 15% tighter row height for dense analytics */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/80 hover:bg-transparent">
                      <TableHead className="py-2 pr-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Network
                      </TableHead>
                      <TableHead className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Price (USD)
                      </TableHead>
                      <TableHead className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        24h Change
                      </TableHead>
                      <TableHead className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Latest Block
                      </TableHead>
                      <TableHead className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Block Time
                      </TableHead>
                      <TableHead className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Suggested Gas
                      </TableHead>
                      <TableHead className="py-2 pl-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item) => {
                      const change = formatChange24h(item.market?.change24h ?? null);
                      const gas = formatGasGwei(
                        item.network?.suggestedGasPriceGwei ?? null,
                        item.network?.gasNote ?? null,
                      );
                      const isPositive = (item.market?.change24h ?? 0) > 0;
                      const isNegative = (item.market?.change24h ?? 0) < 0;
                      const tickerClass =
                        NETWORK_TICKER_CLASSES[item.chain] ||
                        'border-border/60 bg-secondary text-secondary-foreground';
                      const unindexedReason =
                        item.network?.reason ||
                        item.market?.reason ||
                        'Not indexed in Blockchair stats API catalog';

                      return (
                        <TableRow
                          key={item.chain}
                          className="border-b border-border/40 transition-colors hover:bg-surface-elevated/40"
                        >
                          {/* Network & Symbol */}
                          <TableCell className="py-2.5 pr-3.5 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground text-sm">
                                {item.name}
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold border',
                                  tickerClass,
                                )}
                              >
                                {item.nativeSymbol}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {item.market?.status === 'available' ||
                              item.network?.status === 'available'
                                ? 'Blockchair (stats)'
                                : 'Blockchair (unindexed)'}
                            </div>
                          </TableCell>

                          {/* Native Coin Price */}
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground font-semibold text-sm">
                            {item.market?.priceUsd !== null &&
                            item.market?.priceUsd !== undefined ? (
                              formatUsdPrice(item.market.priceUsd)
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* 24h Change */}
                          <TableCell className="py-2.5 px-3 text-right">
                            {item.market?.change24h !== null &&
                            item.market?.change24h !== undefined ? (
                              <div
                                className={cn(
                                  'inline-flex items-center justify-end gap-1 font-mono text-xs tabular-nums font-semibold',
                                  change.colorClass,
                                )}
                              >
                                {isPositive && (
                                  <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                )}
                                {isNegative && (
                                  <TrendingDown
                                    className="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                <span>{change.text}</span>
                              </div>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* Latest Block */}
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground/90 text-xs">
                            {item.network?.latestBlockNumber !== null &&
                            item.network?.latestBlockNumber !== undefined ? (
                              `#${item.network.latestBlockNumber.toLocaleString('en-US')}`
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* Block Time */}
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-muted-foreground text-xs">
                            {item.network?.latestBlockTimestamp !== null &&
                            item.network?.latestBlockTimestamp !== undefined ? (
                              formatRelativeTime(item.network.latestBlockTimestamp)
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>

                          {/* Suggested Gas Price */}
                          <TableCell className="py-2.5 px-3 text-right font-mono tabular-nums text-foreground/90 text-xs">
                            {gas.display === 'Unavailable' ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            ) : gas.note ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-foreground/90 cursor-help underline decoration-dotted underline-offset-2">
                                      {gas.display}
                                    </span>
                                  }
                                />
                                <TooltipContent>{gas.note}</TooltipContent>
                              </Tooltip>
                            ) : (
                              <span title={gas.exact ? `Exact: ${gas.exact}` : undefined}>
                                {gas.display}
                              </span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-2.5 pl-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
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
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] cursor-help"
                                      >
                                        Unavailable
                                      </Badge>
                                    }
                                  />
                                  <TooltipContent>{unindexedReason}</TooltipContent>
                                </Tooltip>
                              )}
                              {!item.market?.isStale &&
                                !item.network?.isStale &&
                                item.market?.status === 'available' &&
                                item.network?.status === 'available' && (
                                  <Badge
                                    variant="success"
                                    className="gap-1.5 font-sans font-medium text-[11px]"
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                                    <span>Live</span>
                                  </Badge>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View (< 768px) */}
              <div className="space-y-2.5 md:hidden">
                {data.map((item) => {
                  const change = formatChange24h(item.market?.change24h ?? null);
                  const gas = formatGasGwei(
                    item.network?.suggestedGasPriceGwei ?? null,
                    item.network?.gasNote ?? null,
                  );
                  const isPositive = (item.market?.change24h ?? 0) > 0;
                  const isNegative = (item.market?.change24h ?? 0) < 0;
                  const tickerClass =
                    NETWORK_TICKER_CLASSES[item.chain] ||
                    'border-border/60 bg-secondary text-secondary-foreground';
                  const unindexedReason =
                    item.network?.reason ||
                    item.market?.reason ||
                    'Not indexed in Blockchair stats API catalog';

                  return (
                    <div
                      key={item.chain}
                      className="rounded-xl border border-border/80 bg-surface-nested/70 p-3 sm:p-3.5 shadow-sm"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{item.name}</span>
                          <span
                            className={cn(
                              'inline-flex items-center rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold border',
                              tickerClass,
                            )}
                          >
                            {item.nativeSymbol}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.market?.isStale && (
                            <Badge variant="warning" className="text-[10px]">
                              Stale
                            </Badge>
                          )}
                          {item.network?.status === 'unavailable' && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Badge variant="secondary" className="text-[10px] cursor-help">
                                    Unavailable
                                  </Badge>
                                }
                              />
                              <TooltipContent>{unindexedReason}</TooltipContent>
                            </Tooltip>
                          )}
                          {!item.market?.isStale &&
                            !item.network?.isStale &&
                            item.market?.status === 'available' &&
                            item.network?.status === 'available' && (
                              <Badge variant="success" className="gap-1.5 text-[10px]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                <span>Live</span>
                              </Badge>
                            )}
                        </div>
                      </div>

                      {/* 2x2 Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2.5">
                        <div className="rounded-lg bg-surface-elevated/40 border border-border/40 p-2">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Coins className="h-3 w-3 text-muted-foreground" />
                            <span>Native Price</span>
                          </span>
                          <div className="font-mono text-sm font-semibold text-foreground tabular-nums mt-0.5">
                            {item.market?.priceUsd !== null &&
                            item.market?.priceUsd !== undefined ? (
                              formatUsdPrice(item.market.priceUsd)
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-surface-elevated/40 border border-border/40 p-2">
                          <span className="text-[11px] text-muted-foreground">24h Change</span>
                          <div
                            className={cn(
                              'flex items-center gap-1 font-mono text-sm font-semibold tabular-nums mt-0.5',
                              change.colorClass,
                            )}
                          >
                            {item.market?.change24h !== null &&
                            item.market?.change24h !== undefined ? (
                              <>
                                {isPositive && (
                                  <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {isNegative && (
                                  <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                <span>{change.text}</span>
                              </>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-surface-elevated/40 border border-border/40 p-2">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span>Latest Block</span>
                          </span>
                          <div className="font-mono text-xs text-foreground/90 tabular-nums mt-0.5">
                            {item.network?.latestBlockNumber !== null &&
                            item.network?.latestBlockNumber !== undefined ? (
                              `#${item.network.latestBlockNumber.toLocaleString('en-US')}`
                            ) : (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {item.network?.latestBlockTimestamp !== null &&
                            item.network?.latestBlockTimestamp !== undefined ? (
                              formatRelativeTime(item.network.latestBlockTimestamp)
                            ) : (
                              <span className="text-muted-foreground">Unavailable</span>
                            )}
                          </div>
                        </div>

                        <div className="rounded-lg bg-surface-elevated/40 border border-border/40 p-2">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Fuel className="h-3 w-3 text-muted-foreground" />
                            <span>Suggested Gas</span>
                          </span>
                          <div className="font-mono text-xs text-foreground/90 tabular-nums mt-0.5">
                            {gas.display === 'Unavailable' ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-muted-foreground font-normal text-xs cursor-help">
                                      Unavailable
                                    </span>
                                  }
                                />
                                <TooltipContent>{unindexedReason}</TooltipContent>
                              </Tooltip>
                            ) : gas.note ? (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="text-foreground/90 cursor-help underline decoration-dotted underline-offset-2">
                                      {gas.display}
                                    </span>
                                  }
                                />
                                <TooltipContent>{gas.note}</TooltipContent>
                              </Tooltip>
                            ) : (
                              gas.display
                            )}
                          </div>
                          {gas.exact && gas.exact !== gas.display && (
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px] mt-0.5">
                              {gas.exact}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Source Footnote */}
                      <div className="mt-2.5 border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground flex flex-col gap-0.5">
                        <div>
                          Source:{' '}
                          {item.market?.status === 'available' ||
                          item.network?.status === 'available'
                            ? 'Blockchair (stats)'
                            : 'Blockchair (unindexed in stats catalog)'}
                          {item.network?.updatedAt &&
                            ` (${formatSourceTimestamp(item.network.updatedAt)})`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Note & Source Attribution */}
              <div className="mt-3 border-t border-border/60 pt-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-muted-foreground">
                <div>
                  Source: Official Blockchair API (Ethereum stats; BSC & Polygon PoS are unindexed
                  in Blockchair stats API catalog).
                </div>
                <div className="text-muted-foreground/80">
                  Gas estimates are advisory; actual network execution costs vary by gas limit and
                  priority fee.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
