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
          desc: 'All on-chain actions and logs were decoded using standard EVM ERC schemas.',
        };
      case 'partial':
        return {
          badge: 'Decoder: Partial',
          style: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          dot: 'bg-amber-400',
          desc: 'Some events or internal contract calls require archive traces or custom decoders.',
        };
      case 'unsupported':
      default:
        return {
          badge: 'Decoder: Unsupported',
          style: 'border-zinc-700 bg-zinc-800 text-zinc-400',
          dot: 'bg-zinc-500',
          desc: 'Contract methods or event signatures are outside standard ERC decoder coverage.',
        };
    }
  };

  const getCoverageReasonDescription = (reason: CoverageReason): string => {
    const map: Record<CoverageReason, string> = {
      metadata_unavailable: 'Token metadata (symbol or decimals) could not be verified on-chain',
      receipt_unavailable: 'Transaction receipt was not returned by the RPC node',
      unsupported_call: 'Smart contract method call is not recognized by standard ERC interfaces',
      trace_not_available: 'Internal EVM trace is not supported on standard RPC endpoints',
      temporary_enrichment_failure: 'Upstream RPC timed out during auxiliary data enrichment',
      provider_discrepancy: 'Upstream providers returned inconsistent ledger states',
    };
    return map[reason] || reason.replace(/_/g, ' ');
  };

  const coverageInfo = getCoverageLabel();

  return (
    <section aria-label="Technical details" className="p-5 sm:p-6 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-sans text-xs text-zinc-400 transition hover:text-zinc-200 focus:outline-none"
      >
        <span className="flex items-center gap-2 uppercase tracking-wider font-semibold">
          <span className="font-mono text-zinc-500">{isOpen ? '▼' : '▶'}</span>
          <span>Technical details</span>
        </span>
        <span className="text-[11px] text-zinc-500">
          {isOpen ? 'Hide technical details' : 'View technical details'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-3 border-t border-zinc-800/60 text-xs">
          {/* Decoder Coverage & Limitations Section */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3.5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold font-sans">
                EVM Decoder Coverage
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-medium ${coverageInfo.style}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${coverageInfo.dot}`} />
                {coverageInfo.badge}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{coverageInfo.desc}</p>

            {data.coverageReasons && data.coverageReasons.length > 0 && (
              <div className="mt-3 border-t border-zinc-800/60 pt-2.5">
                <span className="text-[10px] uppercase text-zinc-500 block mb-1.5 font-sans">
                  Coverage limitations:
                </span>
                <ul className="space-y-1">
                  {data.coverageReasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-[11px] text-zinc-400">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span className="font-sans">{getCoverageReasonDescription(reason)}</span>
                      <span className="font-mono text-[10px] text-zinc-500">({reason})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Transaction Hash */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="uppercase text-[11px] font-semibold text-zinc-400 font-sans">
                Full Transaction Hash
              </span>
              <CopyButton text={data.transactionHash} label="transaction hash" />
            </div>
            <p className="break-all text-zinc-200 select-all font-mono text-xs">{data.transactionHash}</p>
          </div>

          {/* Technical Ledger Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-w-0">
            {/* Native Transaction Value */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold font-sans">
                Native Transaction Value
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold font-mono">{data.value.formatted}</span>
                <span className="text-zinc-400 font-mono text-xs">{data.value.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">
                Raw: {data.value.raw} wei
              </span>
            </div>

            {/* Network Fee Breakdown */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold font-sans">
                Network Fee Breakdown
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-zinc-200">
                <span className="text-sm font-bold font-mono">{data.fee.formatted}</span>
                <span className="text-zinc-400 font-mono text-xs">{data.fee.symbol}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">
                Raw: {data.fee.raw} wei
                {data.technical?.gasUsed ? ` • Gas Used: ${data.technical.gasUsed}` : ''}
              </span>
            </div>

            {/* Block Number & Timestamp */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold font-sans">
                Block Height & Timestamp
              </span>
              <span className="text-zinc-200 font-bold font-mono mt-1 block">#{data.blockNumber}</span>
              <span className="text-[11px] text-zinc-400 mt-1 block font-sans">
                {data.timestamp ? formatTimestamp(data.timestamp) : 'Just now'}
              </span>
            </div>

            {/* Cache Resolution & Diagnostics */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
              <span className="text-[11px] uppercase text-zinc-400 block font-semibold font-sans">
                Cache Resolution & Request
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-zinc-400 font-sans">Status:</span>
                {meta.cache.hit ? (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 font-sans">
                    Redis Hit
                  </span>
                ) : (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300 text-[10px] border border-zinc-700 font-sans">
                    Live Upstream Fetch
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-500 min-w-0">
                <span className="font-mono truncate min-w-0" title={meta.requestId}>
                  Request ID: {meta.requestId ? `${meta.requestId.slice(0, 12)}...` : 'n/a'}
                </span>
                {meta.requestId && <CopyButton text={meta.requestId} label="request id" className="shrink-0" />}
              </div>
            </div>
          </div>

          {/* Calldata Input if available */}
          {data.technical?.inputData && (
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-3 min-w-0">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="uppercase text-[11px] font-semibold text-zinc-400 font-sans">
                  Input Calldata
                </span>
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
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-sans text-xs font-medium text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                <span>View on block explorer</span>
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
    </section>
  );
}
