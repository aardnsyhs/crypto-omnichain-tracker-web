'use client';

import React, { useState } from 'react';
import type { TransactionData, LookupMetadata, CoverageReason } from '../lib/api-types';
import { formatTimestamp } from '../lib/validation';
import { CopyButton } from './CopyButton';

interface TechnicalDetailsProps {
  data: TransactionData;
  meta: LookupMetadata;
}

export function TechnicalDetails({ data, meta }: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getCoverageLabel = () => {
    switch (data.coverage) {
      case 'complete':
        return {
          badge: 'Decoder: Complete',
          style: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
          dot: 'bg-sky-400',
          desc: 'All actions and logs were decoded using standard EVM ERC schemas.',
        };
      case 'partial':
        return {
          badge: 'Decoder: Partial',
          style: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          dot: 'bg-amber-400',
          desc: 'Some contract logs or internal calls require specialized application decoders or trace data.',
        };
      case 'unsupported':
      default:
        return {
          badge: 'Decoder: Unsupported',
          style: 'border-zinc-700 bg-zinc-800 text-zinc-400',
          dot: 'bg-zinc-500',
          desc: 'Contract method or event signatures are not supported by standard ERC decoders.',
        };
    }
  };

  const getCoverageReasonDescription = (reason: CoverageReason): string => {
    const map: Record<CoverageReason, string> = {
      metadata_unavailable: 'Token contract metadata (symbol/decimals) could not be verified on-chain',
      receipt_unavailable: 'Transaction receipt was not returned by the RPC provider',
      unsupported_call: 'Contract method signature is not recognized by standard ERC interfaces',
      trace_not_available: 'Internal VM execution traces are not supported on standard RPC endpoints',
      temporary_enrichment_failure: 'Upstream RPC timed out while resolving auxiliary event details',
      provider_discrepancy: 'Upstream provider returned conflicting ledger state',
    };
    return map[reason] || reason.replace(/_/g, ' ');
  };

  const coverageInfo = getCoverageLabel();

  return (
    <div className="p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-mono text-xs text-zinc-400 transition hover:text-zinc-200 focus:outline-none"
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
        <div className="mt-4 space-y-4 pt-3 border-t border-zinc-800/60 text-xs font-mono">
          {/* Decoder Coverage & Limitations Section */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                Decoder Scope & Coverage
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${coverageInfo.style}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${coverageInfo.dot}`} />
                {coverageInfo.badge}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">{coverageInfo.desc}</p>

            {data.coverageReasons && data.coverageReasons.length > 0 && (
              <div className="mt-3 border-t border-zinc-800/60 pt-2.5">
                <span className="text-[10px] uppercase text-zinc-500 block mb-1.5">
                  Coverage Limitations:
                </span>
                <ul className="space-y-1">
                  {data.coverageReasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-[11px] text-zinc-400">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{getCoverageReasonDescription(reason)}</span>
                      <span className="font-mono text-[10px] text-zinc-500">({reason})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Transaction Hash */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="uppercase text-[11px] font-semibold text-zinc-400">Transaction Hash</span>
              <CopyButton text={data.transactionHash} label="hash" />
            </div>
            <p className="break-all text-zinc-200 select-all font-mono">{data.transactionHash}</p>
          </div>

          {/* Technical Ledger Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Native Transaction Value */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold">
                Native Transaction Value
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold">{data.value.formatted}</span>
                <span className="text-zinc-400">{data.value.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Raw: {data.value.raw} wei
              </span>
            </div>

            {/* Network Fee Breakdown */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold">
                Network Fee Paid Breakdown
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold">{data.fee.formatted}</span>
                <span className="text-zinc-400">{data.fee.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Raw: {data.fee.raw} wei{' '}
                {data.technical?.gasUsed ? `• Gas Used: ${data.technical.gasUsed}` : ''}
              </span>
            </div>

            {/* Block Number & Timestamp */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold">Block Height</span>
              <span className="text-zinc-200 font-bold mt-1 block">#{data.blockNumber}</span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Block Time: {data.timestamp ? formatTimestamp(data.timestamp) : 'Recent'}
              </span>
            </div>

            {/* Cache Resolution & Diagnostics */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold">
                Cache & Diagnostics
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-zinc-400">Resolution:</span>
                {meta.cache.hit ? (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                    Redis Hit
                  </span>
                ) : (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 text-[10px] border border-zinc-700">
                    Live Upstream Fetch
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400">
                <span title={meta.requestId}>
                  Request ID: {meta.requestId ? `${meta.requestId.slice(0, 12)}...` : 'n/a'}
                </span>
                {meta.requestId && <CopyButton text={meta.requestId} label="id" />}
              </div>
            </div>
          </div>

          {/* Calldata Input if available */}
          {data.technical?.inputData && (
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/40 p-3">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="uppercase text-[11px] font-semibold text-zinc-400">Calldata Input</span>
                <CopyButton text={data.technical.inputData} label="calldata" />
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
