'use client';

import React, { useState } from 'react';
import type { TransactionData, LookupMetadata } from '../lib/api-types';
import { copyToClipboard, formatTimestamp } from '../lib/validation';

interface TechnicalDetailsProps {
  data: TransactionData;
  meta: LookupMetadata;
}

export function TechnicalDetails({ data, meta }: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-mono text-xs text-zinc-400 transition hover:text-zinc-200"
      >
        <span className="flex items-center gap-2 uppercase tracking-wider font-semibold">
          <span>{isOpen ? '▼' : '▶'}</span>
          <span>Technical Ledger & Proof Details</span>
        </span>
        <span className="text-[11px] text-zinc-500">
          {isOpen ? 'Collapse panel' : 'Expand technical view'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-2 border-t border-zinc-800/60 text-xs font-mono">
          {/* Transaction Hash */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="uppercase text-[11px]">Transaction Hash</span>
              <button
                type="button"
                onClick={() => handleCopy('hash', data.transactionHash)}
                className="text-zinc-400 hover:text-white"
              >
                {copiedKey === 'hash' ? '✓ copied' : 'copy'}
              </button>
            </div>
            <p className="break-all text-zinc-200 select-all">{data.transactionHash}</p>
          </div>

          {/* Grid of Values */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Native Transaction Value */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-500 block">
                Native Transaction Value
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold">{data.value.formatted}</span>
                <span className="text-zinc-400">{data.value.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Raw: {data.value.raw} wei
              </span>
            </div>

            {/* Network Fee Breakdown */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-500 block">
                Transaction Fee Breakdown
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold">{data.fee.formatted}</span>
                <span className="text-zinc-400">{data.fee.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Raw: {data.fee.raw} wei{' '}
                {data.technical?.gasUsed ? `• Gas Used: ${data.technical.gasUsed}` : ''}
              </span>
            </div>

            {/* Block Number & Timestamp */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-500 block">Block Height</span>
              <span className="text-zinc-200 font-bold mt-1 block">#{data.blockNumber}</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Block Time: {data.timestamp ? formatTimestamp(data.timestamp) : 'Unavailable'}
              </span>
            </div>

            {/* Cache Resolution & Request ID */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-500 block">Cache & Diagnostics</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-zinc-400">Resolution:</span>
                {meta.cache.hit ? (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 text-[10px]">
                    Redis Hit
                  </span>
                ) : (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400 text-[10px]">
                    Live Upstream Fetch
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 block mt-1" title={meta.requestId}>
                Request ID: {meta.requestId ? `${meta.requestId.slice(0, 12)}...` : 'n/a'}
              </span>
            </div>
          </div>

          {/* Calldata Input if available */}
          {data.technical?.inputData && (
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="uppercase text-[11px]">Calldata Input</span>
                <button
                  type="button"
                  onClick={() => handleCopy('calldata', data.technical!.inputData!)}
                  className="text-zinc-400 hover:text-white"
                >
                  {copiedKey === 'calldata' ? '✓ copied' : 'copy'}
                </button>
              </div>
              <p className="break-all text-[11px] text-zinc-400 max-h-24 overflow-y-auto font-mono">
                {data.technical.inputData}
              </p>
            </div>
          )}

          {/* Explorer Link */}
          {data.explorerUrl && (
            <div className="pt-2 flex justify-end">
              <a
                href={data.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
