'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { TransactionData, TokenTransferItem } from '../lib/api-types';
import { formatReadableAmount, truncateHashOrAddress } from '../lib/validation';
import { CopyButton } from './CopyButton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
  const [openRowIds, setOpenRowIds] = useState<Set<string>>(new Set());
  const DEFAULT_LIMIT = 5;

  const hasNativeValue =
    Boolean(data.value?.raw) && data.value.raw !== '0' && data.value.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];

  // Build unified indexed list of all movements to maintain strict chronological order
  const movements: NormalizedMovement[] = [];

  if (hasNativeValue) {
    movements.push({
      id: 'native-0',
      index: 1,
      type: 'native',
      symbol: data.value.symbol,
      name: 'Native ' + data.value.symbol,
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
      <div className="border-b border-zinc-800/60 p-5 sm:p-6 text-center">
        <p className="font-sans text-xs text-zinc-400">
          No standard ERC-20 token transfers detected within decoder coverage.
        </p>
        <p className="mt-1 font-sans text-xs text-zinc-500">
          Internal contract state changes require archive trace data.
        </p>
      </div>
    );
  }

  const visibleMovements = isExpanded ? movements : movements.slice(0, DEFAULT_LIMIT);
  const hasMore = totalMovements > DEFAULT_LIMIT;

  const toggleRowDetail = (id: string) => {
    setOpenRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section aria-label="Asset transfers" className="p-5 sm:p-6 min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-sans">
            Asset transfers
          </h3>
          <Badge variant="outline" className="font-mono text-[11px] text-zinc-300">
            {totalMovements} {totalMovements === 1 ? 'transfer' : 'transfers'}
          </Badge>
        </div>
        {hasMore && (
          <span className="font-sans text-xs text-zinc-500">
            {isExpanded
              ? `Showing all ${totalMovements} transfers`
              : `Showing 1 to ${DEFAULT_LIMIT} of ${totalMovements} transfers`}
          </span>
        )}
      </div>

      {/* 1. DESKTOP VIEW: Aligned 6-Column Ledger Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block rounded-xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden min-w-0 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/80 bg-zinc-900/60 font-sans text-zinc-400 font-semibold">
              <th className="py-2.5 px-3.5 w-12 text-center">#</th>
              <th className="py-2.5 px-3 min-w-[140px]">Asset</th>
              <th className="py-2.5 px-3 text-right min-w-[150px]">Amount</th>
              <th className="py-2.5 px-3 min-w-[200px]">From</th>
              <th className="py-2.5 px-3 min-w-[200px]">To</th>
              <th className="py-2.5 px-3 text-center w-20">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850/60">
            {visibleMovements.map((item) => {
              const val = formatReadableAmount(item.formattedAmount);
              const isNative = item.type === 'native';
              const isRowOpen = openRowIds.has(item.id);

              return (
                <React.Fragment key={item.id}>
                  <tr className="transition-colors hover:bg-zinc-850/30">
                    {/* 1. Index */}
                    <td className="py-3 px-3.5 text-center font-mono text-xs font-semibold text-zinc-500">
                      #{item.index}
                    </td>

                    {/* 2. Asset */}
                    <td className="py-3 px-3 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Badge
                          variant={isNative ? 'success' : 'default'}
                          className="text-[10px] py-0 px-1.5 font-sans shrink-0"
                        >
                          {isNative ? 'Native' : 'ERC-20'}
                        </Badge>
                        <span className="font-sans font-semibold text-zinc-100 truncate" title={item.name || item.symbol}>
                          {item.symbol}
                        </span>
                        {item.name && item.name !== item.symbol && (
                          <span className="text-[11px] text-zinc-500 font-sans truncate hidden lg:inline" title={item.name}>
                            ({item.name})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Amount (Right Aligned) */}
                    <td className="py-3 px-3 text-right min-w-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className="font-mono text-xs sm:text-sm font-bold text-zinc-100 truncate"
                          title={item.formattedAmount !== null ? val.exact : item.rawAmount}
                        >
                          {item.formattedAmount !== null
                            ? `${val.display} ${item.symbol}`
                            : `${item.rawAmount} (Raw amount, decimals unavailable)`}
                        </span>
                        {val.isApproximate && item.formattedAmount !== null && (
                          <CopyButton
                            text={val.exact}
                            label={`exact ${item.symbol} amount`}
                            iconOnly
                            className="shrink-0"
                          />
                        )}
                        {item.formattedAmount === null && (
                          <CopyButton
                            text={item.rawAmount}
                            label={`raw ${item.symbol} amount`}
                            iconOnly
                            className="shrink-0"
                          />
                        )}
                      </div>
                    </td>

                    {/* 4. From */}
                    <td className="py-3 px-3 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="font-mono text-zinc-300 font-medium select-all"
                          title={item.from}
                        >
                          {truncateHashOrAddress(item.from, 6, 4)}
                        </span>
                        <CopyButton text={item.from} label="sender address" iconOnly />
                      </div>
                    </td>

                    {/* 5. To */}
                    <td className="py-3 px-3 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="font-mono text-zinc-300 font-medium select-all"
                          title={item.to || 'Contract Deployment'}
                        >
                          {item.to ? truncateHashOrAddress(item.to, 6, 4) : 'Contract Deployment'}
                        </span>
                        {item.to && <CopyButton text={item.to} label="recipient address" iconOnly />}
                      </div>
                    </td>

                    {/* 6. Details Action */}
                    <td className="py-3 px-3 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRowDetail(item.id)}
                        className="font-sans text-[11px] h-6 px-2 text-zinc-400 hover:text-zinc-200"
                      >
                        {isRowOpen ? 'Hide' : 'Details'}
                      </Button>
                    </td>
                  </tr>

                  {/* Expanded Sub-row with technical proofs */}
                  {isRowOpen && (
                    <tr className="bg-zinc-950/90 border-b border-zinc-800/80">
                      <td colSpan={6} className="py-2.5 px-4 text-xs font-sans text-zinc-400">
                        <div className="flex flex-wrap items-center justify-between gap-3 min-w-0">
                          <div className="flex flex-wrap items-center gap-4 min-w-0">
                            {!isNative && item.tokenAddress && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-zinc-500 font-medium">Token contract:</span>
                                <span className="font-mono text-zinc-300 select-all" title={item.tokenAddress}>
                                  {item.tokenAddress}
                                </span>
                                <CopyButton text={item.tokenAddress} label="token contract address" iconOnly />
                              </div>
                            )}

                            {item.logIndex !== undefined && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500 font-medium">Log index:</span>
                                <span className="font-mono text-zinc-300">#{item.logIndex}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-500 font-medium">Exact amount:</span>
                            <span className="font-mono font-semibold text-zinc-200 select-all" title={item.formattedAmount !== null ? val.exact : item.rawAmount}>
                              {item.formattedAmount !== null
                                ? `${val.exact} ${item.symbol}`
                                : `${item.rawAmount} (Raw amount, decimals unavailable)`}
                            </span>
                            <CopyButton
                              text={item.formattedAmount !== null ? val.exact : item.rawAmount}
                              label="exact amount"
                              iconOnly
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Expand / Collapse Button Bar */}
        {hasMore && (
          <div className="p-3 text-center bg-zinc-950/90 border-t border-zinc-800">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 font-sans text-xs font-semibold"
            >
              <span>
                {isExpanded
                  ? 'Show first 5'
                  : `Show all ${totalMovements} transfers`}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 2. MOBILE VIEW: Stacked Card List (< 768px, specifically 320px & 375px) */}
      <div className="md:hidden space-y-3 min-w-0">
        {visibleMovements.map((item) => {
          const val = formatReadableAmount(item.formattedAmount);
          const isNative = item.type === 'native';
          const isRowOpen = openRowIds.has(item.id);

          return (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 shadow-sm min-w-0"
            >
              {/* Card Header: Asset Type, Index, and Token Name */}
              <div className="flex items-center justify-between border-b border-zinc-850/80 pb-2.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-xs font-semibold text-zinc-500">
                    #{item.index}
                  </span>
                  <Badge
                    variant={isNative ? 'success' : 'default'}
                    className="text-[10px] py-0 px-1.5 font-sans"
                  >
                    {isNative ? 'Native' : 'ERC-20'}
                  </Badge>
                  <span className="font-sans font-bold text-sm text-zinc-100 truncate min-w-0" title={item.name || item.symbol}>
                    {item.symbol}
                  </span>
                </div>

                {/* Amount on Mobile Card Header */}
                <div className="text-right shrink-0">
                  <span
                    className="font-mono text-xs font-bold text-zinc-100"
                    title={item.formattedAmount !== null ? val.exact : item.rawAmount}
                  >
                    {item.formattedAmount !== null
                      ? `${val.display} ${item.symbol}`
                      : `${item.rawAmount} (Raw amount)`}
                  </span>
                </div>
              </div>

              {/* Stacked Sender & Recipient: STRICTLY SEPARATE LINES FOR MOBILE READABILITY */}
              <div className="pt-2.5 pb-1 space-y-2 text-xs font-sans min-w-0">
                {/* From line */}
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-zinc-500 font-medium shrink-0">From:</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-mono text-zinc-300 text-xs truncate min-w-0" title={item.from}>
                      {truncateHashOrAddress(item.from, 6, 4)}
                    </span>
                    <CopyButton text={item.from} label="sender address" iconOnly />
                  </div>
                </div>

                {/* To line */}
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                  <span className="text-zinc-500 font-medium shrink-0">To:</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="font-mono text-zinc-300 text-xs truncate min-w-0"
                      title={item.to || 'Contract Deployment'}
                    >
                      {item.to ? truncateHashOrAddress(item.to, 6, 4) : 'Contract Deployment'}
                    </span>
                    {item.to && <CopyButton text={item.to} label="recipient address" iconOnly />}
                  </div>
                </div>
              </div>

              {/* Row Detail Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-850/80 mt-2 text-[11px] font-sans">
                <button
                  type="button"
                  onClick={() => toggleRowDetail(item.id)}
                  className="text-zinc-400 hover:text-zinc-200 transition focus:outline-none"
                >
                  {isRowOpen ? 'Hide details' : 'Details'}
                </button>

                {val.isApproximate && item.formattedAmount !== null && (
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">Copy exact:</span>
                    <CopyButton text={val.exact} label="exact amount" iconOnly />
                  </div>
                )}
                {item.formattedAmount === null && (
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">Copy raw:</span>
                    <CopyButton text={item.rawAmount} label="raw amount" iconOnly />
                  </div>
                )}
              </div>

              {/* Expanded Forensic Detail Drawer on Mobile */}
              {isRowOpen && (
                <div className="mt-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex flex-col gap-1.5 min-w-0 font-sans">
                  {!isNative && item.tokenAddress && (
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-zinc-500 shrink-0 font-medium">Token contract:</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-mono text-zinc-300 text-[11px] truncate" title={item.tokenAddress}>
                          {truncateHashOrAddress(item.tokenAddress, 6, 4)}
                        </span>
                        <CopyButton text={item.tokenAddress} label="token contract address" iconOnly />
                      </div>
                    </div>
                  )}

                  {item.logIndex !== undefined && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-500 font-medium">Log index:</span>
                      <span className="font-mono text-zinc-300">#{item.logIndex}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
                    <span className="text-zinc-500 font-medium">Exact amount:</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-mono text-xs text-zinc-200 select-all truncate" title={item.formattedAmount !== null ? val.exact : item.rawAmount}>
                        {item.formattedAmount !== null
                          ? `${val.exact} ${item.symbol}`
                          : `${item.rawAmount} (Raw amount, decimals unavailable)`}
                      </span>
                      <CopyButton
                        text={item.formattedAmount !== null ? val.exact : item.rawAmount}
                        label="exact amount"
                        iconOnly
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Mobile Expand / Collapse Button */}
        {hasMore && (
          <div className="p-3 text-center bg-zinc-950/90 border border-zinc-850 rounded-xl">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2 font-sans text-xs font-semibold w-full"
            >
              <span>
                {isExpanded
                  ? 'Show first 5'
                  : `Show all ${totalMovements} transfers`}
              </span>
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
