'use client';

import React, { useState } from 'react';
import type { TransactionData, TokenTransferItem } from '../lib/api-types';
import { formatReadableAmount, truncateHashOrAddress } from '../lib/validation';
import { CopyButton } from './CopyButton';

interface AssetTransfersProps {
  data: TransactionData;
}

interface NormalizedMovement {
  id: string;
  index: number;
  type: 'native' | 'erc20';
  symbol: string;
  name?: string | null;
  rawAmount: string;
  formattedAmount: string | null;
  decimals?: number | null;
  from: string;
  to: string;
  tokenAddress?: string;
  logIndex?: string | number;
}

export function AssetTransfers({ data }: AssetTransfersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const DEFAULT_LIMIT = 5;

  const hasNativeValue =
    Boolean(data.value?.raw) && data.value.raw !== '0' && data.value.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];

  // Build unified indexed list of all movements to maintain strict order
  const movements: NormalizedMovement[] = [];

  if (hasNativeValue) {
    movements.push({
      id: 'native-0',
      index: 1,
      type: 'native',
      symbol: data.value.symbol,
      rawAmount: data.value.raw,
      formattedAmount: data.value.formatted,
      from: data.from,
      to: data.to || 'Contract Deployment',
    });
  }

  tokenTransfers.forEach((item: TokenTransferItem, idx: number) => {
    movements.push({
      id: `erc20-${item.tokenAddress}-${item.logIndex}-${idx}`,
      index: movements.length + 1,
      type: 'erc20',
      symbol: item.symbol || 'Token',
      name: item.name,
      rawAmount: item.rawAmount,
      formattedAmount: item.formattedAmount,
      decimals: item.decimals,
      from: item.from,
      to: item.to,
      tokenAddress: item.tokenAddress,
      logIndex: item.logIndex,
    });
  });

  const totalMovements = movements.length;

  if (totalMovements === 0) {
    return (
      <div className="border-b border-zinc-800/80 p-5 sm:p-6 text-center">
        <p className="font-mono text-xs text-zinc-400">
          No standard ERC-20 transfers detected within decoder scope.
        </p>
        <p className="mt-1 font-mono text-[11px] text-zinc-500">
          Contract internal state changes or custom event signatures require archive trace data.
        </p>
      </div>
    );
  }

  const visibleMovements = isExpanded ? movements : movements.slice(0, DEFAULT_LIMIT);
  const hasMore = totalMovements > DEFAULT_LIMIT;

  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Transferred Assets
          </h3>
          <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
            {totalMovements} {totalMovements === 1 ? 'Movement' : 'Movements'}
          </span>
        </div>
        {hasMore && (
          <span className="font-mono text-[11px] text-zinc-500">
            {isExpanded
              ? `Showing all ${totalMovements}`
              : `Showing 1–${DEFAULT_LIMIT} of ${totalMovements}`}
          </span>
        )}
      </div>

      <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800/80 bg-zinc-950/40 overflow-hidden">
        {visibleMovements.map((item) => {
          const val = formatReadableAmount(item.formattedAmount);
          const isNative = item.type === 'native';

          return (
            <div key={item.id} className="p-4 sm:p-5 min-w-0">
              {/* Header row: Index, Asset Pill, Name, and Formatted Amount */}
              <div className="flex flex-wrap items-start justify-between gap-2 pb-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  {totalMovements > 1 && (
                    <span className="font-mono text-xs font-bold text-zinc-500 shrink-0">
                      #{item.index}
                    </span>
                  )}
                  <span
                    className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold ${
                      isNative
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                    }`}
                  >
                    {isNative ? 'Native' : 'ERC-20'}
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-100 truncate min-w-0">
                    {item.name ? `${item.name} (${item.symbol})` : item.symbol}
                  </span>
                </div>

                {/* Amount display with mobile-accessible exact precision & copy */}
                <div className="text-right ml-auto min-w-0">
                  <div
                    className="font-mono text-sm sm:text-base font-bold text-zinc-100"
                    title={val.exact}
                  >
                    {item.formattedAmount !== null
                      ? `${val.display} ${item.symbol}`
                      : `${item.rawAmount} raw units`}
                  </div>

                  {val.isApproximate && item.formattedAmount !== null && (
                    <div className="mt-0.5 flex items-center justify-end gap-1.5 text-[10px] font-mono text-zinc-400">
                      <span className="truncate" title={val.exact}>
                        Exact: {val.exact} {item.symbol}
                      </span>
                      <CopyButton text={val.exact} label="exact amount" iconOnly className="shrink-0" />
                    </div>
                  )}

                  {item.decimals === null && !isNative && (
                    <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                      Decimals unverified on-chain
                    </div>
                  )}
                </div>
              </div>

              {/* Movement Flow: Sender ──► Recipient and Token Contract */}
              <div className="mt-2 flex flex-col gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3 min-w-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Sender (From)
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                    <span
                      className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0 select-all"
                      title={item.from}
                    >
                      {truncateHashOrAddress(item.from, 10, 8)}
                    </span>
                    <CopyButton text={item.from} label="from" className="shrink-0" />
                  </div>
                </div>

                <div className="hidden sm:block text-zinc-500 font-mono text-xs px-2 shrink-0">
                  ──►
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Recipient (To)
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                    <span
                      className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0 select-all"
                      title={item.to}
                    >
                      {truncateHashOrAddress(item.to, 10, 8)}
                    </span>
                    <CopyButton text={item.to} label="to" className="shrink-0" />
                  </div>
                </div>

                {!isNative && item.tokenAddress && (
                  <div className="min-w-0 flex-1 sm:border-l sm:border-zinc-800 sm:pl-3 pt-2 sm:pt-0 border-t border-zinc-800 sm:border-t-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                      Token Contract
                    </span>
                    <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                      <span
                        className="font-mono text-xs text-zinc-400 truncate min-w-0 select-all"
                        title={item.tokenAddress}
                      >
                        {truncateHashOrAddress(item.tokenAddress, 8, 6)}
                      </span>
                      <CopyButton text={item.tokenAddress} label="contract" className="shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Expand / Collapse Toggle for lists > 5 */}
        {hasMore && (
          <div className="p-3 text-center border-t border-zinc-800/80 bg-zinc-900/30">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <span>
                {isExpanded ? 'Show fewer (first 5 transfers)' : `Show all ${totalMovements} transfers`}
              </span>
              <span>{isExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
