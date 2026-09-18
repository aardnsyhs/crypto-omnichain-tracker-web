'use client';

import React, { useState } from 'react';
import type { TransactionLookupResponse } from '../lib/api-types';
import { copyToClipboard, formatTimestamp, truncateHashOrAddress } from '../lib/validation';

interface TransactionResultCardProps {
  response: TransactionLookupResponse;
}

export function TransactionResultCard({ response }: TransactionResultCardProps) {
  const { data, meta } = response;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-medium text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
    }
  };

  const getChainBadge = () => {
    const chainMap: Record<string, { label: string }> = {
      ethereum: { label: 'Ethereum' },
      bsc: { label: 'BNB Smart Chain' },
      polygon: { label: 'Polygon PoS' },
    };
    const c = chainMap[data.chain] || { label: data.chain };
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-medium text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        <span>{c.label}</span>
      </span>
    );
  };

  return (
    <article className="w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 px-5 py-4">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {getChainBadge()}
        </div>

        {/* Subtle Cache Metadata Indicator */}
        <div className="flex items-center gap-2">
          {meta.cache.hit ? (
            <span
              title="Served immediately from low-latency Redis cache-aside"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Cache Hit (Redis)</span>
            </span>
          ) : (
            <span
              title="Fetched live from upstream Blockchair provider"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[11px] font-medium text-zinc-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              <span>Live Upstream</span>
            </span>
          )}
        </div>
      </div>

      {/* Ledger Rows */}
      <div className="divide-y divide-zinc-800/50 px-5 text-sm">
        {/* Transaction Hash */}
        <div className="py-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Transaction Hash
            </span>
            <button
              type="button"
              onClick={() => handleCopy('hash', data.transactionHash)}
              className="font-mono text-xs text-zinc-400 transition hover:text-zinc-200"
            >
              {copiedKey === 'hash' ? '✓ copied' : 'copy'}
            </button>
          </div>
          <p className="break-all font-mono text-xs text-zinc-200 select-all">
            {data.transactionHash}
          </p>
        </div>

        {/* Value and Fee Row */}
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
              Transferred Value
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-bold tracking-tight text-zinc-100">
                {data.value.formatted}
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {data.value.symbol}
              </span>
            </div>
            <span
              className="mt-0.5 block font-mono text-[11px] text-zinc-500"
              title={`Raw: ${data.value.raw}`}
            >
              {data.value.raw} wei
            </span>
          </div>

          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
              Transaction Fee
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-bold tracking-tight text-zinc-100">
                {data.fee.formatted}
              </span>
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {data.fee.symbol}
              </span>
            </div>
            <span
              className="mt-0.5 block font-mono text-[11px] text-zinc-500"
              title={`Raw: ${data.fee.raw}`}
            >
              {data.fee.raw} wei
            </span>
          </div>
        </div>

        {/* From and To Row */}
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                From (Sender)
              </span>
              <button
                type="button"
                onClick={() => handleCopy('from', data.from)}
                className="font-mono text-xs text-zinc-400 transition hover:text-zinc-200"
              >
                {copiedKey === 'from' ? '✓ copied' : 'copy'}
              </button>
            </div>
            <p className="font-mono text-xs text-zinc-200 select-all" title={data.from}>
              {truncateHashOrAddress(data.from, 12, 10)}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                To (Recipient)
              </span>
              {data.to && (
                <button
                  type="button"
                  onClick={() => handleCopy('to', data.to!)}
                  className="font-mono text-xs text-zinc-400 transition hover:text-zinc-200"
                >
                  {copiedKey === 'to' ? '✓ copied' : 'copy'}
                </button>
              )}
            </div>
            <p
              className="font-mono text-xs text-zinc-200 select-all"
              title={data.to || 'Contract Deployment'}
            >
              {data.to ? (
                truncateHashOrAddress(data.to, 12, 10)
              ) : (
                <span className="italic text-zinc-500">Contract Deployment</span>
              )}
            </p>
          </div>
        </div>

        {/* Block Height and Timestamp */}
        <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
              Block Height
            </span>
            <p className="mt-1 font-mono text-xs text-zinc-200">#{data.blockNumber}</p>
          </div>
          <div>
            <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500">
              Timestamp
            </span>
            <p className="mt-1 font-mono text-xs text-zinc-200">
              {formatTimestamp(data.timestamp)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Explorer link & Request ID */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/80 bg-zinc-950/40 px-5 py-3 text-xs">
        <div className="font-mono text-zinc-500" title={meta.requestId}>
          Request ID: <span className="text-zinc-400">{meta.requestId.slice(0, 8)}...</span>
        </div>

        {data.explorerUrl && (
          <a
            href={data.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700/90 hover:text-white"
          >
            <span>View on Explorer</span>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
