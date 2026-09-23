'use client';

import React from 'react';
import type { TransactionData } from '../lib/api-types';
import { truncateHashOrAddress } from '../lib/validation';

interface AssetTransfersProps {
  data: TransactionData;
}

export function AssetTransfers({ data }: AssetTransfersProps) {
  const isFailed = data.status === 'failed';
  const hasNativeValue =
    data.value && data.value.raw && data.value.raw !== '0' && data.value.raw !== '0x0';

  const tokenTransfers = data.tokenTransfers || [];
  const hasTransfers = hasNativeValue || tokenTransfers.length > 0;

  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Transferred Assets
        </h3>
        <span className="font-mono text-xs text-zinc-500">
          {tokenTransfers.length + (hasNativeValue ? 1 : 0)} asset movement(s) detected
        </span>
      </div>

      {isFailed ? (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="font-mono text-xs text-rose-300">
            No asset transfers took effect because the transaction failed and was reverted on-chain.
          </p>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">
            Gas fee of {data.fee.formatted} {data.fee.symbol} was consumed by the block validator.
          </p>
        </div>
      ) : !hasTransfers ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 text-center">
          <p className="font-mono text-xs text-zinc-400">
            No token transfers found within supported decoder scope.
          </p>
          <p className="mt-1 font-mono text-[11px] text-zinc-600">
            Arbitrary contract internal transfers or custom event schemas require archive trace
            data.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Native Asset Transfer */}
          {hasNativeValue && (
            <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
                    Native
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    {data.value.symbol}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-zinc-100">
                  {data.value.formatted} {data.value.symbol}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">From</span>
                  <span className="font-mono text-zinc-300" title={data.from}>
                    {truncateHashOrAddress(data.from, 10, 8)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">To</span>
                  <span className="font-mono text-zinc-300" title={data.to || 'Contract'}>
                    {data.to ? truncateHashOrAddress(data.to, 10, 8) : 'Contract Deployment'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ERC-20 Token Transfers */}
          {tokenTransfers.map((item, idx) => (
            <div
              key={`${item.tokenAddress}-${item.logIndex}-${idx}`}
              className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-sky-400">
                    ERC-20
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    {item.name
                      ? `${item.name} (${item.symbol || '???'})`
                      : item.symbol || 'Unknown Token'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-zinc-100">
                    {item.formattedAmount !== null
                      ? `${item.formattedAmount} ${item.symbol || ''}`
                      : `${item.rawAmount} (raw units)`}
                  </div>
                  {item.decimals === null && (
                    <span className="text-[10px] font-mono text-amber-400">
                      Decimals unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">From</span>
                  <span className="font-mono text-zinc-300" title={item.from}>
                    {truncateHashOrAddress(item.from, 8, 6)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">To</span>
                  <span className="font-mono text-zinc-300" title={item.to}>
                    {truncateHashOrAddress(item.to, 8, 6)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Contract
                  </span>
                  <span className="font-mono text-zinc-400 text-[11px]" title={item.tokenAddress}>
                    {truncateHashOrAddress(item.tokenAddress, 8, 6)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
