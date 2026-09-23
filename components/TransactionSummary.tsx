'use client';

import React, { useState } from 'react';
import type { TransactionData } from '../lib/api-types';
import { copyToClipboard, formatTimestamp } from '../lib/validation';

interface TransactionSummaryProps {
  data: TransactionData;
  onShare?: () => void;
}

export function TransactionSummary({ data }: TransactionSummaryProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/?chain=${data.chain}&tx=${data.transactionHash}`;
      const ok = await copyToClipboard(shareUrl);
      if (ok) {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-medium text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Failed (Reverted)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending On-Chain
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 font-mono text-xs font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Unknown Status
          </span>
        );
    }
  };

  const getCoverageBadge = () => {
    switch (data.coverage) {
      case 'complete':
        return (
          <span
            title="Full narrative available within supported decoder scope"
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-sky-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            Decoder: Complete
          </span>
        );
      case 'partial':
        return (
          <span
            title={
              data.coverageReasons?.length
                ? `Partial coverage: ${data.coverageReasons.join(', ')}`
                : 'Some actions or logs could not be fully decoded'
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-amber-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Decoder: Partial
          </span>
        );
      case 'unsupported':
      default:
        return (
          <span
            title="Contract interaction method or events not supported by standard decoders"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 font-mono text-[11px] font-medium text-zinc-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Decoder: Unsupported
          </span>
        );
    }
  };

  const getChainLabel = () => {
    const map: Record<string, string> = {
      ethereum: 'Ethereum',
      bsc: 'BNB Smart Chain',
      polygon: 'Polygon PoS',
    };
    return map[data.chain] || data.chain;
  };

  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge()}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-medium text-zinc-300">
            {getChainLabel()}
          </span>
          {getCoverageBadge()}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1 font-mono text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span>{copiedShare ? 'Copied link!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Narrative Story Banner */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">
          Transaction Story
        </div>
        <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
          {data.explanation}
        </p>

        {data.coverageReasons && data.coverageReasons.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Coverage details:</span>
            {data.coverageReasons.map((reason) => (
              <span
                key={reason}
                className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
              >
                {reason.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Network Fee & Retrieval Time Highlight */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/30 px-3.5 py-2.5">
          <span className="text-xs font-mono text-zinc-400">Network Fee</span>
          <span className="font-mono text-sm font-semibold text-zinc-100">
            {data.fee.formatted} {data.fee.symbol}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/30 px-3.5 py-2.5">
          <span className="text-xs font-mono text-zinc-400">Data Updated</span>
          <span className="font-mono text-xs text-zinc-300" title={data.fetchedAt}>
            {formatTimestamp(data.fetchedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
