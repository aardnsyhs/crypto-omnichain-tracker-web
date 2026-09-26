'use client';

import { useState } from 'react';
import { Share2, Check, Info, RefreshCw, Loader2 } from 'lucide-react';
import type { TransactionData } from '../lib/api-types';
import {
  copyToClipboard,
  formatReadableAmount,
  formatTimestamp,
  truncateHashOrAddress,
} from '../lib/validation';
import { NETWORK_REGISTRY } from '../lib/network-registry';
import { CopyButton } from './CopyButton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { cn } from '../lib/utils';

interface TransactionSummaryProps {
  data: TransactionData;
  onShare?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function TransactionSummary({
  data,
  onShare,
  onRetry,
  isRetrying,
}: TransactionSummaryProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/?chain=${data.chain}&tx=${data.transactionHash}`;
      const ok = await copyToClipboard(shareUrl);
      if (ok) {
        setCopiedShare(true);
        onShare?.();
        setTimeout(() => setCopiedShare(false), 2000);
      }
    }
  };

  const getStatusBadge = () => {
    switch (data.status) {
      case 'confirmed':
        return (
          <Badge variant="success" className="gap-1.5 font-sans font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
            <span>Confirmed</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1.5 font-sans font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>Failed (Reverted)</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="gap-1.5 font-sans font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Pending On-Chain</span>
          </Badge>
        );
      case 'unknown':
      default:
        return (
          <Badge variant="secondary" className="gap-1.5 font-sans font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <span>Unknown Status</span>
          </Badge>
        );
    }
  };

  const getChainLabel = () => {
    const config = NETWORK_REGISTRY[data.chain];
    return config?.name || data.chain;
  };

  const getChainBadgeStyle = () => {
    const config = NETWORK_REGISTRY[data.chain];
    return config?.visuals.tickerClass || 'border-border/60 bg-secondary text-secondary-foreground';
  };

  // Derive transaction structure & hero focus
  const isFailed = data.status === 'failed';
  const hasNativeValue =
    Boolean(data.value?.raw) && data.value?.raw !== '0' && data.value?.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];
  const approvals = data.approvals || [];
  const totalTransfers = (hasNativeValue ? 1 : 0) + tokenTransfers.length;

  const isPureApproval = !hasNativeValue && tokenTransfers.length === 0 && approvals.length > 0;
  const isSingleTransfer = totalTransfers === 1;
  const isMultiTransfer = totalTransfers > 1;

  const feeFormatted = formatReadableAmount(data.fee?.formatted);

  const getConciseStory = () => {
    if (isFailed) {
      return null;
    }

    if (isMultiTransfer) {
      const uniqueAssetKeys = new Set<string>();
      if (hasNativeValue) {
        uniqueAssetKeys.add(`${data.chain}:native`);
      }
      tokenTransfers.forEach((t) => {
        const key = t.tokenAddress
          ? `${data.chain}:${t.tokenAddress.toLowerCase()}`
          : `${data.chain}:unknown:${(t.symbol || 'token').toLowerCase()}`;
        uniqueAssetKeys.add(key);
      });
      const uniqueCount = uniqueAssetKeys.size;
      return `${totalTransfers} asset ${totalTransfers === 1 ? 'movement' : 'movements'}${
        approvals.length > 0
          ? ` and ${approvals.length} token ${approvals.length === 1 ? 'approval' : 'approvals'}`
          : ''
      } recorded on-chain across ${uniqueCount} unique ${uniqueCount === 1 ? 'asset' : 'assets'}.`;
    }

    if (isPureApproval) {
      const a = approvals[0];
      const allowanceDesc = a.isUnlimited
        ? 'maximum allowance'
        : a.isRevocation
          ? '0 allowance (revoked)'
          : `${formatReadableAmount(a.formattedAmount).display} ${a.symbol || ''}`;
      return `Approved ${truncateHashOrAddress(a.spender, 8, 6)} for ${allowanceDesc} on block #${data.blockNumber}.`;
    }

    return data.explanation;
  };

  const conciseStory = getConciseStory();

  const renderTitle = () => {
    if (isFailed) {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-200 font-sans">
            Transaction Execution Failed (Reverted)
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-rose-300/80 font-sans">
            Transaction execution failed. State changes were reverted by the network, while the
            execution gas fee was still consumed.
          </p>
        </div>
      );
    }

    if (isPureApproval) {
      const a = approvals[0];
      const isUnlimited = a.isUnlimited;
      const isRevocation = a.isRevocation;
      const formattedAmt = formatReadableAmount(a.formattedAmount);

      return (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">
              Token Approval
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="font-sans text-xs text-foreground/90 font-medium">
              {a.name || a.symbol}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
            {isUnlimited
              ? 'Maximum Allowance Granted'
              : isRevocation
                ? 'Allowance Revoked (0)'
                : `${formattedAmt.display} ${a.symbol || ''} Authorized`}
          </h2>
        </div>
      );
    }

    const isReceiptUnavailable = data.coverageReasons?.includes('receipt_unavailable');

    if (isReceiptUnavailable && totalTransfers === 1) {
      const valFormatted = formatReadableAmount(
        hasNativeValue ? data.value?.formatted : tokenTransfers[0]?.formattedAmount,
      );
      const symbol = hasNativeValue ? data.value?.symbol : tokenTransfers[0]?.symbol || 'Token';
      return (
        <div>
          <div className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold mb-1">
            1 Detected Transfer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {valFormatted.display} {symbol}
          </h2>
        </div>
      );
    }

    if (isSingleTransfer) {
      if (hasNativeValue && data.value) {
        const valFormatted = formatReadableAmount(data.value.formatted);
        return (
          <div>
            <div className="font-mono text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1">
              Native {data.value.symbol} Transfer
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {valFormatted.display} {data.value.symbol}
            </h2>
          </div>
        );
      } else {
        const t = tokenTransfers[0];
        const valFormatted = formatReadableAmount(t.formattedAmount);
        return (
          <div>
            <div className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-1">
              {t.symbol} Token Transfer
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {valFormatted.display} {t.symbol || 'Token'}
            </h2>
          </div>
        );
      }
    }

    if (isMultiTransfer) {
      return (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Transaction Activity
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans">
            {totalTransfers} Asset {totalTransfers === 1 ? 'Movement' : 'Movements'}
            {approvals.length > 0
              ? ` & ${approvals.length} Token ${approvals.length === 1 ? 'Approval' : 'Approvals'}`
              : ''}
          </h2>
        </div>
      );
    }

    return (
      <div>
        <div className="font-sans text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
          Smart Contract Interaction
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-sans truncate">
          {data.to ? truncateHashOrAddress(data.to, 12, 10) : 'Contract Deployment'}
        </h2>
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 min-w-0">
      {/* 1. Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {getStatusBadge()}
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-xs font-medium',
              getChainBadgeStyle(),
            )}
          >
            {getChainLabel()}
          </span>
          <span className="text-border hidden xs:inline">•</span>
          <span className="font-mono text-xs text-muted-foreground">Block #{data.blockNumber}</span>
          {data.timestamp && (
            <>
              <span className="text-border hidden sm:inline">•</span>
              <span className="font-sans text-xs text-muted-foreground hidden sm:inline">
                {formatTimestamp(data.timestamp)}
              </span>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 font-sans"
        >
          {copiedShare ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied Link</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Executive Impact Header */}
      <div className="pt-4 pb-2 min-w-0">{renderTitle()}</div>

      {/* 3. Essential Forensic Metadata Row */}
      <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 rounded-xl bg-surface-nested border border-border/80 p-3 sm:px-4 text-xs min-w-0 shadow-inner">
        {/* From */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-muted-foreground font-medium shrink-0">From:</span>
          <span
            className="font-mono font-medium text-foreground truncate min-w-0"
            title={data.from || ''}
          >
            {truncateHashOrAddress(data.from || '', 6, 4)}
          </span>
          {data.from && (
            <CopyButton text={data.from} label="initiator address" iconOnly className="shrink-0" />
          )}
        </div>

        <span className="text-border hidden sm:inline">|</span>

        {/* To */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-muted-foreground font-medium shrink-0">To:</span>
          <span
            className="font-mono font-medium text-foreground truncate min-w-0"
            title={data.to || 'Contract Deployment'}
          >
            {data.to ? truncateHashOrAddress(data.to, 6, 4) : 'Contract Deployment'}
          </span>
          {data.to && (
            <CopyButton text={data.to} label="target address" iconOnly className="shrink-0" />
          )}
        </div>

        <span className="text-border hidden sm:inline">|</span>

        {/* Network Fee */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-muted-foreground font-medium shrink-0">
            Network fee paid:
          </span>
          <span
            className="font-mono font-semibold text-foreground"
            title={
              feeFormatted.exact ? `${feeFormatted.exact} ${data.fee?.symbol || ''}` : undefined
            }
          >
            {feeFormatted.display} {data.fee?.symbol || ''}
          </span>
        </div>
      </div>

      {/* 4. Narrative Summary */}
      {conciseStory && (
        <div className="mt-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
          {conciseStory}
        </div>
      )}

      {/* 5. Limitation Notice */}
      {data.coverage === 'partial' && (
        <Alert
          variant="warning"
          className={cn(
            'mt-4',
            data.coverageReasons?.includes('receipt_unavailable') &&
              'border-amber-500/40 bg-amber-950/30 text-amber-200',
          )}
        >
          <Info
            className={cn(
              'h-4 w-4 shrink-0',
              data.coverageReasons?.includes('receipt_unavailable')
                ? 'text-amber-400'
                : 'text-amber-500',
            )}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <AlertTitle
              className={cn(
                'font-semibold',
                data.coverageReasons?.includes('receipt_unavailable')
                  ? 'text-amber-300'
                  : 'text-foreground',
              )}
            >
              {data.coverageReasons?.includes('receipt_unavailable')
                ? 'Transaction Data Incomplete'
                : 'Partial Decoder Coverage'}
            </AlertTitle>
            <AlertDescription
              className={cn(
                'text-xs sm:text-sm mt-1',
                data.coverageReasons?.includes('receipt_unavailable')
                  ? 'text-amber-200/90'
                  : 'text-muted-foreground',
              )}
            >
              {data.coverageReasons?.includes('receipt_unavailable')
                ? 'Transaction data is incomplete. Token transfers and approvals may be missing because the receipt could not be retrieved.'
                : 'Some internal contract actions or custom events require archive trace data and are not decoded by standard EVM schemas.'}
            </AlertDescription>
            {data.coverageReasons?.includes('receipt_unavailable') && onRetry && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="gap-1.5 text-xs h-8 border-amber-500/40 hover:bg-amber-500/20 text-amber-200 font-sans cursor-pointer disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                      <span>Retrying receipt...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                      <span>Retry missing data</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}
    </div>
  );
}
