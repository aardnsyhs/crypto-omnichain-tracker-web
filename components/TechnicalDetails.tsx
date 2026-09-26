'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Cpu,
  Terminal,
  Hash,
  Layers,
  Fuel,
  Server,
} from 'lucide-react';
import type { TransactionData, LookupMetadata, CoverageReason } from '../lib/api-types';
import { formatTimestamp } from '../lib/validation';
import { CopyButton } from './CopyButton';
import { Badge } from './ui/badge';

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
          variant: 'success' as const,
          dot: 'bg-emerald-400',
          desc: 'All on-chain actions and logs were decoded using standard EVM ERC schemas.',
        };
      case 'partial':
        return {
          badge: 'Decoder: Partial',
          variant: 'warning' as const,
          dot: 'bg-amber-400',
          desc: 'Some events or internal contract calls require archive traces or custom decoders.',
        };
      case 'unsupported':
      default:
        return {
          badge: 'Decoder: Unsupported',
          variant: 'secondary' as const,
          dot: 'bg-muted-foreground',
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
        className="flex w-full min-h-[44px] items-center justify-between font-sans text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
      >
        <span className="flex items-center gap-2 uppercase tracking-wider font-semibold">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span>Technical details</span>
        </span>
        <span className="text-[11px] text-muted-foreground font-sans">
          {isOpen ? 'Hide technical details' : 'View technical details'}
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 pt-4 border-t border-border/60 text-xs">
          {/* Decoder Coverage & Limitations Section */}
          <div className="rounded-xl border border-border/80 bg-surface-nested p-4 min-w-0 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold font-sans flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                <span>EVM Decoder Coverage</span>
              </span>
              <Badge variant={coverageInfo.variant} className="gap-1.5 font-sans text-[11px]">
                <span className={`h-1.5 w-1.5 rounded-full ${coverageInfo.dot}`} />
                <span>{coverageInfo.badge}</span>
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
              {coverageInfo.desc}
            </p>

            {data.coverageReasons && data.coverageReasons.length > 0 && (
              <div className="mt-3 border-t border-border/50 pt-2.5">
                <span className="text-[10px] uppercase text-muted-foreground block mb-1.5 font-sans font-medium">
                  Coverage limitations:
                </span>
                <ul className="space-y-1">
                  {data.coverageReasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2 text-[11px] text-muted-foreground"
                    >
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span className="font-sans text-foreground/90">
                        {getCoverageReasonDescription(reason)}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        ({reason})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Full Transaction Hash */}
          <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="uppercase text-[11px] font-semibold text-muted-foreground font-sans flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span>Full Transaction Hash</span>
              </span>
              <CopyButton text={data.transactionHash} label="transaction hash" />
            </div>
            <p className="break-all text-foreground select-all font-mono text-xs">
              {data.transactionHash}
            </p>
          </div>

          {/* Technical Ledger Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-w-0">
            {/* Native Transaction Value */}
            <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
              <span className="text-[11px] uppercase text-muted-foreground block font-semibold font-sans">
                Native Transaction Value
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-foreground">
                <span className="text-sm font-bold font-mono">{data.value?.formatted || '0'}</span>
                <span className="text-muted-foreground font-mono text-xs">{data.value?.symbol || 'ETH'}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                Raw: {data.value?.raw || '0'} wei
              </span>
            </div>

            {/* Network Fee Breakdown */}
            <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
              <span className="text-[11px] uppercase text-muted-foreground block font-semibold font-sans flex items-center gap-1.5">
                <Fuel className="h-3 w-3 text-muted-foreground" />
                <span>Network Fee Breakdown</span>
              </span>
              <div className="mt-1 flex items-baseline gap-1.5 text-foreground">
                <span className="text-sm font-bold font-mono">{data.fee.formatted}</span>
                <span className="text-muted-foreground font-mono text-xs">{data.fee.symbol}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                Raw: {data.fee.raw} wei
                {data.technical?.gasUsed ? ` • Gas Used: ${data.technical.gasUsed}` : ''}
              </span>
            </div>

            {/* Block Number & Timestamp */}
            <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
              <span className="text-[11px] uppercase text-muted-foreground block font-semibold font-sans flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-muted-foreground" />
                <span>Block Height & Timestamp</span>
              </span>
              <span className="text-foreground font-bold font-mono mt-1 block">
                #{data.blockNumber}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block font-sans">
                {data.timestamp ? formatTimestamp(data.timestamp) : 'Just now'}
              </span>
            </div>

            {/* Cache Resolution & Diagnostics */}
            <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
              <span className="text-[11px] uppercase text-muted-foreground block font-semibold font-sans flex items-center gap-1.5">
                <Server className="h-3 w-3 text-muted-foreground" />
                <span>Cache Resolution & Request</span>
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-muted-foreground font-sans">Status:</span>
                {meta.cache.hit ? (
                  <Badge variant="success" className="text-[10px] font-sans">
                    Redis Hit
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] font-sans">
                    Live Upstream Fetch
                  </Badge>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground min-w-0">
                <span className="font-mono truncate min-w-0" title={meta.requestId}>
                  Request ID: {meta.requestId ? `${meta.requestId.slice(0, 12)}...` : 'n/a'}
                </span>
                {meta.requestId && (
                  <CopyButton text={meta.requestId} label="request id" className="shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Calldata Input if available */}
          {data.technical?.inputData && (
            <div className="rounded-xl border border-border/80 bg-surface-nested p-3.5 min-w-0 shadow-inner">
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <span className="uppercase text-[11px] font-semibold text-muted-foreground font-sans flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Input Calldata</span>
                </span>
                <CopyButton text={data.technical.inputData} label="calldata" />
              </div>
              <p className="break-all text-[11px] text-muted-foreground max-h-24 overflow-y-auto font-mono bg-surface-elevated/70 p-2.5 rounded-lg border border-border/60">
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
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border/80 bg-surface-nested px-3.5 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:bg-surface-elevated hover:text-white"
              >
                <span>View on block explorer</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
