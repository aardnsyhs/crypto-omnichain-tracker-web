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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
    }
  };

  const getChainBadge = () => {
    const chainMap: Record<string, { label: string; color: string }> = {
      ethereum: { label: 'Ethereum', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      bsc: {
        label: 'BNB Smart Chain',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      },
      polygon: {
        label: 'Polygon PoS',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      },
    };
    const c = chainMap[data.chain] || { label: data.chain, color: 'bg-slate-800 text-slate-300' };
    return (
      <span
        className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${c.color}`}
      >
        {c.label}
      </span>
    );
  };

  return (
    <article className="w-full rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur transition hover:border-slate-700">
      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          {getStatusBadge()}
          {getChainBadge()}
        </div>

        {/* Subtle Cache Metadata Indicator */}
        <div className="flex items-center gap-2">
          {meta.cache.hit ? (
            <span
              title="Served immediately from low-latency Redis cache-aside"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-300"
            >
              <span>⚡</span>
              <span>Redis Cache Hit</span>
            </span>
          ) : (
            <span
              title="Fetched live from upstream Blockchair provider"
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-950/40 px-2.5 py-1 text-xs font-medium text-indigo-300"
            >
              <span>🌐</span>
              <span>Blockchair Upstream</span>
            </span>
          )}
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Transaction Hash
          </span>
          <button
            type="button"
            onClick={() => handleCopy('hash', data.transactionHash)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            {copiedKey === 'hash' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="break-all rounded-lg border border-slate-800 bg-slate-950/80 p-3 font-mono text-xs text-slate-200">
          {data.transactionHash}
        </p>
      </div>

      {/* Addresses & Value Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* From */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              From (Sender)
            </span>
            <button
              type="button"
              onClick={() => handleCopy('from', data.from)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              {copiedKey === 'from' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-mono text-sm text-slate-200" title={data.from}>
            {truncateHashOrAddress(data.from, 10, 8)}
          </p>
        </div>

        {/* To */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              To (Recipient)
            </span>
            {data.to && (
              <button
                type="button"
                onClick={() => handleCopy('to', data.to!)}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                {copiedKey === 'to' ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          <p className="font-mono text-sm text-slate-200" title={data.to || 'Contract Deployment'}>
            {data.to ? (
              truncateHashOrAddress(data.to, 10, 8)
            ) : (
              <span className="italic text-slate-500">Contract Deployment</span>
            )}
          </p>
        </div>

        {/* Value */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4">
          <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            Transferred Value
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-white">{data.value.formatted}</span>
            <span className="text-xs font-semibold text-indigo-400">{data.value.symbol}</span>
          </div>
          <span
            className="mt-0.5 block font-mono text-[10px] text-slate-500"
            title={`Raw: ${data.value.raw}`}
          >
            {data.value.raw} wei
          </span>
        </div>

        {/* Gas Fee */}
        <div className="rounded-lg border border-slate-800/80 bg-slate-950/50 p-4">
          <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
            Transaction Fee
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-lg font-bold text-white">{data.fee.formatted}</span>
            <span className="text-xs font-semibold text-slate-300">{data.fee.symbol}</span>
          </div>
          <span
            className="mt-0.5 block font-mono text-[10px] text-slate-500"
            title={`Raw: ${data.fee.raw}`}
          >
            {data.fee.raw} wei
          </span>
        </div>
      </div>

      {/* Block & Timestamp Metadata */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 p-3 text-xs">
          <span className="text-slate-400">Block Height: </span>
          <span className="font-mono font-medium text-slate-200">#{data.blockNumber}</span>
        </div>
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/30 p-3 text-xs">
          <span className="text-slate-400">Timestamp: </span>
          <span className="font-mono text-slate-200">{formatTimestamp(data.timestamp)}</span>
        </div>
      </div>

      {/* Footer: Explorer link & Request ID */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs">
        <div className="font-mono text-slate-500" title={meta.requestId}>
          Request ID: <span className="text-slate-400">{meta.requestId.slice(0, 8)}...</span>
        </div>

        {data.explorerUrl && (
          <a
            href={data.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 font-medium text-indigo-300 transition hover:bg-indigo-500/20 hover:text-white"
          >
            <span>View on Explorer</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
