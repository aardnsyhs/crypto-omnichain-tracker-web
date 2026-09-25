'use client';

import { useMemo } from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import type { HistoryItem, SupportedChain } from '../lib/api-types';
import { truncateHashOrAddress, formatTimestamp } from '../lib/validation';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
            <Badge variant="outline" className="font-mono text-[10px]">
              Not Found
            </Badge>
          );
        case 'rate_limited':
          return (
            <Badge variant="warning" className="font-mono text-[10px]">
              Rate Limited
            </Badge>
          );
        default:
          return (
            <Badge variant="secondary" className="font-mono text-[10px]">
              {item.outcome}
            </Badge>
          );
      }
    }

    // Lookup succeeded -> show blockchain execution status
    switch (item.txStatus) {
      case 'confirmed':
        return (
          <Badge variant="success" className="font-mono text-[10px]">
            Confirmed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="font-mono text-[10px]">
            Failed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="font-mono text-[10px]">
            Pending
          </Badge>
        );
      case 'unknown':
      default:
        return (
          <Badge variant="secondary" className="font-mono text-[10px]">
            Unknown
          </Badge>
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
      <span className="inline-flex items-center rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300 shadow-inner">
        {symbol}
      </span>
    );
  };

  return (
    <Card className="w-full shadow-xl border-zinc-800/90 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/80 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-xs font-sans uppercase tracking-wider text-zinc-400 font-semibold">
            Recent searches
          </CardTitle>
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {dedupedHistory.length} {dedupedHistory.length === 1 ? 'transaction' : 'transactions'}
          {history.length > dedupedHistory.length && (
            <span className="text-zinc-600 ml-1">({history.length} searches)</span>
          )}
        </span>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && dedupedHistory.length === 0 ? (
          <div className="py-8 text-center font-sans text-xs text-zinc-500 animate-pulse">
            Loading search history...
          </div>
        ) : dedupedHistory.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Clock className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
            <p className="font-sans text-xs text-zinc-400 font-medium">
              No transactions searched yet in this session.
            </p>
            <p className="mt-1 font-sans text-[11px] text-zinc-600">
              Searches performed will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850/60">
            {dedupedHistory.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-2.5 px-3.5 py-3 transition-colors hover:bg-zinc-850/30 sm:px-5 sm:flex-row sm:items-center sm:justify-between min-w-0"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {getChainBadge(item.chain)}
                  <span
                    className="font-mono text-xs text-zinc-200 truncate min-w-0 select-all font-medium"
                    title={item.transactionHash}
                  >
                    {truncateHashOrAddress(item.transactionHash, 6, 4)}
                  </span>
                  {getStatusBadge(item)}
                  {item.cacheHit && (
                    <span
                      title="Served from Redis cache"
                      className="inline-flex shrink-0 items-center rounded bg-emerald-500/10 px-1.5 py-0.5 font-sans text-[10px] text-emerald-400 border border-emerald-500/20"
                    >
                      cache
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end min-w-0">
                  <span className="font-mono text-[11px] text-zinc-500 truncate" title={item.searchedAt}>
                    {formatTimestamp(item.searchedAt)}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelect(item.chain as SupportedChain, item.transactionHash)}
                    className="gap-1.5 text-xs font-sans group-hover:border-zinc-700"
                  >
                    <RotateCcw className="h-3 w-3 text-zinc-400" />
                    <span>Search again</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
