'use client';

import { useState } from 'react';
import {
  ExternalLink,
  Check,
  Copy,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Database,
  Cpu,
  Share2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import type { TransactionLookupResponse } from '../lib/api-types';
import {
  copyToClipboard,
  formatReadableAmount,
  formatTimestamp,
  truncateHashOrAddress,
} from '../lib/validation';
import { NETWORK_REGISTRY } from '../lib/network-registry';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { cn } from '../lib/utils';

interface UtxoTransactionViewProps {
  response: TransactionLookupResponse;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function UtxoTransactionView({
  response,
  onRetry,
  isRetrying = false,
}: UtxoTransactionViewProps) {
  const { data, meta } = response;
  const utxo = data.utxo;
  const [copiedTxid, setCopiedTxid] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const config = NETWORK_REGISTRY[data.chain] || NETWORK_REGISTRY.bitcoin;

  const handleCopyTxid = async () => {
    const ok = await copyToClipboard(data.transactionHash);
    if (ok) {
      setCopiedTxid(true);
      setTimeout(() => setCopiedTxid(false), 1500);
    }
  };

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

  const isConfirmed = data.status === 'confirmed';
  const isPending = data.status === 'pending';
  const isFailed = data.status === 'failed';

  const feeFormatted = formatReadableAmount(data.fee?.formatted);
  const outputTotalFormatted = formatReadableAmount(utxo?.outputTotal?.formatted);
  const inputTotalFormatted = formatReadableAmount(utxo?.inputTotal?.formatted);

  return (
    <article className="w-full overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xl backdrop-blur-sm divide-y divide-border/60">
      {/* 1. Header & Primary Identification */}
      <section className="p-4 sm:p-6 bg-surface-nested/40">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Network & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold',
                  config.visuals.badgeClass,
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', config.visuals.dotClass)} />
                <span>{config.name}</span>
                <span className="text-[10px] opacity-75 font-normal">UTXO</span>
              </span>

              {isConfirmed && (
                <Badge variant="success" className="gap-1.5 font-sans font-medium text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  <span>Confirmed</span>
                </Badge>
              )}

              {isPending && (
                <Badge variant="warning" className="gap-1.5 font-sans font-medium text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Mempool / Pending</span>
                </Badge>
              )}

              {isFailed && (
                <Badge variant="destructive" className="gap-1.5 font-sans font-medium text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  <span>Failed</span>
                </Badge>
              )}

              {utxo?.isCoinbase && (
                <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-950/40 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                  Coinbase Reward
                </span>
              )}
            </div>

            {/* Actions: Refresh & Share */}
            <div className="flex items-center gap-2">
              {onRetry && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        disabled={isRetrying}
                        aria-label="Refresh transaction data"
                        className="gap-1.5 text-xs font-sans"
                      >
                        {isRetrying ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">Refresh</span>
                      </Button>
                    }
                  />
                  <TooltipContent>Re-fetch latest status and confirmations from node</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      aria-label="Copy permalink"
                      className="gap-1.5 text-xs font-sans"
                    >
                      {copiedShare ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {copiedShare ? 'Copied' : 'Share'}
                      </span>
                    </Button>
                  }
                />
                <TooltipContent>Copy permalink to clipboard</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* TxID & Explorer Link */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-border/60 bg-surface-elevated/40 p-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider shrink-0 font-semibold">
                TXID:
              </span>
              <span
                className="font-mono text-xs sm:text-sm text-foreground truncate select-all font-medium"
                title={data.transactionHash}
              >
                {data.transactionHash}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyTxid}
                className="h-7 px-2 text-xs font-mono gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedTxid ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>

              <a
                href={data.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-sans text-sky-400 hover:text-sky-300 hover:underline px-2 py-1 rounded"
              >
                <span>View on Explorer</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Neutral Narrative Explanation */}
          {data.explanation && (
            <div className="rounded-lg border border-border/40 bg-surface-nested/60 p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-foreground/90 font-sans leading-relaxed">
                {data.explanation}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Key Metrics Grid */}
      <section className="p-4 sm:p-6 bg-card">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Output */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Total Output
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums truncate">
                {outputTotalFormatted.display}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {config.nativeSymbol}
              </div>
            </div>
          </div>

          {/* Network Fee */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Network Fee
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums truncate">
                {feeFormatted.display}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {config.nativeSymbol} ({data.fee.raw} sat)
              </div>
            </div>
          </div>

          {/* Block Height */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Layers className="h-3 w-3" />
              <span>Block Height</span>
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums truncate">
                {data.blockNumber !== '-1' && data.blockNumber !== '0'
                  ? `#${Number(data.blockNumber).toLocaleString()}`
                  : 'Pending'}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {data.timestamp ? formatTimestamp(data.timestamp) : 'In Mempool'}
              </div>
            </div>
          </div>

          {/* Confirmations */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Confirmations</span>
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                {utxo?.confirmations !== undefined
                  ? utxo.confirmations.toLocaleString()
                  : '0'}
              </div>
              <div
                className="text-[10px] font-mono text-muted-foreground truncate"
                title={
                  utxo?.referenceBlockHeight
                    ? `Recorded at block #${utxo.referenceBlockHeight} (Snapshot: ${formatTimestamp(data.fetchedAt)})`
                    : undefined
                }
              >
                {utxo?.referenceBlockHeight
                  ? `@ block #${utxo.referenceBlockHeight}`
                  : utxo?.confirmations && utxo.confirmations >= 6
                    ? 'High finality (6+)'
                    : utxo?.confirmations && utxo.confirmations > 0
                      ? 'Confirming'
                      : 'Unconfirmed'}
              </div>
            </div>
          </div>

          {/* Transaction Size & Fee Rate */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>Size & Rate</span>
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums">
                {utxo?.size ? `${utxo.size.toLocaleString()} B` : '—'}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {utxo?.feePerByte ? `${utxo.feePerByte} sat/B` : '—'}
                {utxo?.vsize ? ` (${utxo.vsize} vB)` : ''}
              </div>
            </div>
          </div>

          {/* Input / Output Structure */}
          <div className="rounded-lg border border-border/60 bg-surface-nested/50 p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Structure
            </span>
            <div className="mt-1.5">
              <div className="font-mono text-sm sm:text-base font-bold text-foreground tabular-nums">
                {utxo?.inputCount ?? 0} in → {utxo?.outputCount ?? 0} out
              </div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                Total in: {inputTotalFormatted.display}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Truncation Notice Banner (if provider truncated huge UTXO transaction) */}
      {(utxo?.inputsTruncated || utxo?.outputsTruncated) && (
        <section className="bg-amber-950/30 border-y border-amber-500/30 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 text-xs text-amber-200 font-sans">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-semibold">Provider truncation notice:</span> This transaction contains a high volume of inputs or outputs.
              {utxo.inputsTruncated && ` Showing top ${utxo.inputs.length} of ${utxo.inputCount} inputs.`}
              {utxo.outputsTruncated && ` Showing top ${utxo.outputs.length} of ${utxo.outputCount} outputs.`}
              {' '}Full list is available on the blockchain explorer.
            </div>
          </div>
        </section>
      )}

      {/* 3. Inputs & Outputs Ledger */}
      <section className="p-4 sm:p-6 bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                  Inputs ({utxo?.inputs.length ?? 0} of {utxo?.inputCount ?? 0})
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Sum: {inputTotalFormatted.display} {config.nativeSymbol}
              </span>
            </div>

            {utxo?.isCoinbase && (!utxo.inputs || utxo.inputs.length === 0) ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-4 text-xs font-mono text-amber-300/90 leading-relaxed">
                Coinbase Transaction: Newly generated coins minted by the block miner/validator. No previous inputs consumed.
              </div>
            ) : !utxo?.inputs || utxo.inputs.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-muted-foreground">
                No input details returned by provider.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {utxo.inputs.map((inp, idx) => {
                  const val = formatReadableAmount(inp.value.formatted);
                  return (
                    <div
                      key={`input-${inp.index}-${idx}`}
                      className="rounded-lg border border-border/60 bg-surface-nested/50 p-2.5 sm:p-3 text-xs flex flex-col gap-1.5 transition-colors hover:bg-surface-elevated/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                          #{inp.index}
                        </span>
                        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                          {val.display} {config.nativeSymbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground truncate select-all">
                        <span className="shrink-0 text-muted-foreground/60">From:</span>
                        {inp.isCoinbase ? (
                          <span className="text-amber-300 font-semibold">Coinbase / Newly Minted</span>
                        ) : inp.address ? (
                          <span className="truncate text-foreground/90 font-medium" title={inp.address}>
                            {inp.address}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Unknown address / script</span>
                        )}
                      </div>

                      {inp.transactionHash && (
                        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70 truncate">
                          <span className="shrink-0">Prev:</span>
                          <span className="truncate select-all" title={`${inp.transactionHash}:${inp.outputIndex}`}>
                            {truncateHashOrAddress(inp.transactionHash, 8, 6)}:{inp.outputIndex ?? 0}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outputs Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                  Outputs ({utxo?.outputs.length ?? 0} of {utxo?.outputCount ?? 0})
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Sum: {outputTotalFormatted.display} {config.nativeSymbol}
              </span>
            </div>

            {!utxo?.outputs || utxo.outputs.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-muted-foreground">
                No output details returned by provider.
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {utxo.outputs.map((out, idx) => {
                  const val = formatReadableAmount(out.value.formatted);
                  const isOpReturn =
                    out.type === 'nulldata' ||
                    out.type === 'op_return' ||
                    out.address === 'op_return' ||
                    (!out.address && out.scriptHex && out.scriptHex.startsWith('6a'));

                  return (
                    <div
                      key={`output-${out.index}-${idx}`}
                      className="rounded-lg border border-border/60 bg-surface-nested/50 p-2.5 sm:p-3 text-xs flex flex-col gap-1.5 transition-colors hover:bg-surface-elevated/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                            #{out.index}
                          </span>
                          {out.isSpent === true && (
                            <span className="inline-flex items-center rounded bg-surface-elevated px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground border border-border/40">
                              Spent
                            </span>
                          )}
                          {out.isSpent === false && (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.2 font-mono text-[10px] text-emerald-400 border border-emerald-500/30 cursor-help">
                                    Unspent (Snapshot)
                                  </span>
                                }
                              />
                              <TooltipContent>
                                Output was unspent at block #{utxo?.referenceBlockHeight || data.blockNumber} (Snapshot: {formatTimestamp(data.fetchedAt)}). Use Refresh to check current mempool/spending state.
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>

                        <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                          {val.display} {config.nativeSymbol}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground truncate select-all">
                        <span className="shrink-0 text-muted-foreground/60">To:</span>
                        {isOpReturn ? (
                          <span className="text-violet-300 font-semibold" title={out.scriptHex || 'OP_RETURN'}>
                            OP_RETURN (Null Data Script)
                          </span>
                        ) : out.address ? (
                          <span className="truncate text-foreground/90 font-medium" title={out.address}>
                            {out.address}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Non-standard output script</span>
                        )}
                      </div>

                      {out.type && (
                        <div className="text-[10px] font-mono text-muted-foreground/60">
                          Script type: {out.type}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Forensic Metadata & Cache Diagnostics */}
      <section className="p-4 sm:p-5 bg-surface-nested/20">
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span>Provider: Blockchair UTXO API</span>
            </span>

            <span>•</span>

            <span>
              Cache:{' '}
              {meta.cache.hit ? (
                <span className="text-emerald-400 font-semibold">HIT (Redis)</span>
              ) : (
                <span className="text-sky-400 font-semibold">MISS (Live RPC/API)</span>
              )}
            </span>

            <span>•</span>

            <span className="truncate" title={meta.requestId}>
              Req ID: {meta.requestId.slice(0, 8)}...
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] text-muted-foreground/80">
            <span>
              Snapshot: block #{utxo?.referenceBlockHeight || data.blockNumber}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Fetched: {formatTimestamp(data.fetchedAt)}</span>
          </div>
        </div>
      </section>
    </article>
  );
}
