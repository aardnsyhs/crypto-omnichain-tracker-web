'use client';

import React, { useState } from 'react';
import type { TransactionData, TokenTransferItem } from '../lib/api-types';
import { formatReadableAmount, formatUnitsToExactDecimal } from '../lib/validation';
import { CopyButton } from './CopyButton';

interface MovingAssetsSummaryProps {
  data: TransactionData;
}

interface AssetSummaryItem {
  id: string;
  tokenAddress: string | null;
  symbol: string;
  name: string;
  count: number;
  totalRaw: bigint;
  decimals: number;
  exactVolume: string;
  displayVolume: string;
  isNative: boolean;
}

export function MovingAssetsSummary({ data }: MovingAssetsSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  const hasNativeValue =
    Boolean(data.value?.raw) && data.value.raw !== '0' && data.value.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];

  const totalMovements = (hasNativeValue ? 1 : 0) + tokenTransfers.length;
  if (totalMovements <= 1) {
    return null;
  }

  // Token identity strictly follows chain and contract address
  const assetMap = new Map<string, AssetSummaryItem>();

  // 1. Process Native ETH with precise BigInt representation
  if (hasNativeValue) {
    const rawVal = BigInt(data.value.raw);
    const decimals = 18;
    const exactVolume = formatUnitsToExactDecimal(rawVal, decimals);
    const formatted = formatReadableAmount(exactVolume);

    assetMap.set('native', {
      id: 'native',
      tokenAddress: null,
      symbol: data.value.symbol,
      name: 'Native ' + data.value.symbol,
      count: 1,
      totalRaw: rawVal,
      decimals,
      exactVolume,
      displayVolume: formatted.display,
      isNative: true,
    });
  }

  // 2. Process ERC-20 transfers - Grouping strictly by token contract address with BigInt summation
  tokenTransfers.forEach((tx: TokenTransferItem) => {
    // Unique key is tokenAddress.toLowerCase() to ensure distinct tokens (e.g. MORPHO vs fwMORPHO) are never merged
    const key = tx.tokenAddress
      ? tx.tokenAddress.toLowerCase()
      : (tx.symbol || 'unknown-token').toLowerCase();
    const decimals = tx.decimals !== null && tx.decimals !== undefined ? tx.decimals : 18;
    const rawAmount = BigInt(tx.rawAmount || '0');
    const existing = assetMap.get(key);

    if (existing) {
      existing.count += 1;
      existing.totalRaw += rawAmount;
      existing.exactVolume = formatUnitsToExactDecimal(existing.totalRaw, existing.decimals);
      existing.displayVolume = formatReadableAmount(existing.exactVolume).display;
    } else {
      const exactVolume = formatUnitsToExactDecimal(rawAmount, decimals);
      const displayVolume = formatReadableAmount(exactVolume).display;
      assetMap.set(key, {
        id: key,
        tokenAddress: tx.tokenAddress || null,
        symbol: tx.symbol || 'Token',
        name: tx.name || tx.symbol || 'ERC-20 Token',
        count: 1,
        totalRaw: rawAmount,
        decimals,
        exactVolume,
        displayVolume,
        isNative: false,
      });
    }
  });

  const assets = Array.from(assetMap.values());
  const DEFAULT_LIMIT = 5;
  const visibleAssets = isExpanded ? assets : assets.slice(0, DEFAULT_LIMIT);
  const hasMore = assets.length > DEFAULT_LIMIT;

  const toggleDetail = (id: string) => {
    setOpenDetailId((prev) => (prev === id ? null : id));
  };

  return (
    <section aria-label="Assets involved" className="p-5 sm:p-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-sans">
            Assets involved
          </h3>
          <span className="rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
            {assets.length} unique {assets.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-sans">
          Tokens and transfer count in this transaction.
        </span>
      </div>

      {/* Compact List instead of huge cards */}
      <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 divide-y divide-zinc-800/50 overflow-hidden min-w-0">
        {visibleAssets.map((asset) => {
          const isDetailOpen = openDetailId === asset.id;

          return (
            <div key={asset.id} className="p-3 sm:px-4 transition hover:bg-zinc-900/30 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                {/* Left: Token Symbol & Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-xs sm:text-sm text-zinc-100 font-sans truncate">
                    {asset.symbol}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-sans truncate" title={asset.name}>
                    ({asset.name})
                  </span>
                  {asset.isNative && (
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 font-sans text-[10px] text-emerald-400 shrink-0">
                      Native
                    </span>
                  )}
                </div>

                {/* Right: Transfer Count & Detail Toggle */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <span className="font-mono text-xs text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/80">
                    {asset.count} {asset.count === 1 ? 'transfer' : 'transfers'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleDetail(asset.id)}
                    className="font-sans text-[11px] text-zinc-400 hover:text-zinc-200 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 transition"
                  >
                    {isDetailOpen ? 'Hide total' : 'View total'}
                  </button>
                </div>
              </div>

              {/* Expandable Aggregate Volume Detail with BigInt precision */}
              {isDetailOpen && (
                <div className="mt-2.5 pt-2 border-t border-zinc-900 flex flex-col gap-1 text-xs min-w-0 font-sans">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-400 font-medium shrink-0">
                      Total amount across transfers:
                    </span>
                    <span className="font-mono font-semibold text-zinc-100 truncate" title={asset.exactVolume}>
                      {asset.displayVolume} {asset.symbol}
                    </span>
                    <CopyButton text={asset.exactVolume} label={`total ${asset.symbol} amount`} iconOnly className="shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Note: Assets transferred through multiple intermediaries may be counted more than once.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Compact Toggle: Show all assets vs Show first 5 */}
        {hasMore && (
          <div className="p-2.5 text-center bg-zinc-950/80">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-zinc-400 hover:text-zinc-200 transition focus:outline-none"
            >
              <span>
                {isExpanded
                  ? 'Show first 5'
                  : `Show all ${assets.length} assets`}
              </span>
              <span className="font-mono text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
