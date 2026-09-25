'use client';

import { useState } from 'react';
import { Share2, Check, Info } from 'lucide-react';
import type { TransactionData } from '../lib/api-types';
import {
  copyToClipboard,
  formatReadableAmount,
  formatTimestamp,
  truncateHashOrAddress,
} from '../lib/validation';
import { CopyButton } from './CopyButton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

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
          <Badge variant="success" className="gap-1.5 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span>Confirmed</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1.5 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>Failed (Reverted)</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" className="gap-1.5 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>Pending On-Chain</span>
          </Badge>
        );
      case 'unknown':
      default:
        return (
          <Badge variant="secondary" className="gap-1.5 font-sans">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            <span>Unknown Status</span>
          </Badge>
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

  // Derive transaction structure & hero focus
  const isFailed = data.status === 'failed';
  const hasNativeValue =
    Boolean(data.value?.raw) && data.value.raw !== '0' && data.value.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];
  const approvals = data.approvals || [];
  const totalTransfers = (hasNativeValue ? 1 : 0) + tokenTransfers.length;

  const isPureApproval = !hasNativeValue && tokenTransfers.length === 0 && approvals.length > 0;
  const isSingleTransfer = totalTransfers === 1;
  const isMultiTransfer = totalTransfers > 1;

  const feeFormatted = formatReadableAmount(data.fee?.formatted);

  // Derive concise, data-driven narrative without giant repetitive paragraphs
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

  // Render Title and Sub-action
  const renderTitle = () => {
    if (isFailed) {
      return (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-rose-200 font-sans">
            Transaction Execution Failed (Reverted)
          </h2>
          <p className="mt-1 text-sm text-zinc-400 font-sans">
            Transaction execution failed. Execution changes were reverted, but the network fee was
            still paid.
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
            <span className="text-xs text-zinc-500">•</span>
            <span className="font-sans text-xs text-zinc-300 font-medium">
              {a.name || a.symbol}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans">
            {isUnlimited
              ? 'Maximum Allowance Granted'
              : isRevocation
                ? 'Allowance Revoked (0)'
                : `${formattedAmt.display} ${a.symbol || ''} Authorized`}
          </h2>
        </div>
      );
    }

    if (isSingleTransfer) {
      if (hasNativeValue) {
        const valFormatted = formatReadableAmount(data.value.formatted);
        return (
          <div>
            <div className="font-mono text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-1">
              Native {data.value.symbol} Transfer
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 font-mono">
              {valFormatted.display} {data.value.symbol}
            </h2>
          </div>
        );
      } else {
        const t = tokenTransfers[0];
        const valFormatted = formatReadableAmount(t.formattedAmount);
        return (
          <div>
            <div className="font-mono text-xs text-sky-400 uppercase tracking-wider font-semibold mb-1">
              {t.symbol} Token Transfer
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100 font-mono">
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
            <span className="font-sans text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Transaction Activity
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans">
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
        <div className="font-sans text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">
          Smart Contract Interaction
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 font-sans truncate">
          {data.to ? truncateHashOrAddress(data.to, 12, 10) : 'Contract Deployment'}
        </h2>
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 min-w-0">
      {/* 1. Top Meta Bar: Status, Chain, Block & Share Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/60 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {getStatusBadge()}
          <Badge variant="secondary" className="font-sans text-xs font-medium text-zinc-300">
            {getChainLabel()}
          </Badge>
          <span className="text-zinc-600 hidden xs:inline">•</span>
          <span className="font-mono text-xs text-zinc-400">Block #{data.blockNumber}</span>
          {data.timestamp && (
            <>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="font-sans text-xs text-zinc-400 hidden sm:inline">
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
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Executive Impact Header (Single-Sheet typography, no nested card) */}
      <div className="pt-4 pb-2 min-w-0">{renderTitle()}</div>

      {/* 3. Essential Forensic Metadata Row: From, To, and Network fee paid (strictly ONCE) */}
      <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3 text-xs min-w-0">
        {/* Initiator */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-zinc-400 font-medium shrink-0">From:</span>
          <span className="font-mono font-medium text-zinc-200 truncate min-w-0" title={data.from}>
            {truncateHashOrAddress(data.from, 6, 4)}
          </span>
          <CopyButton text={data.from} label="initiator address" iconOnly className="shrink-0" />
        </div>

        <span className="text-zinc-700 hidden sm:inline">|</span>

        {/* Target Contract */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-zinc-400 font-medium shrink-0">To:</span>
          <span
            className="font-mono font-medium text-zinc-200 truncate min-w-0"
            title={data.to || 'Contract Deployment'}
          >
            {data.to ? truncateHashOrAddress(data.to, 6, 4) : 'Contract Deployment'}
          </span>
          {data.to && (
            <CopyButton text={data.to} label="target address" iconOnly className="shrink-0" />
          )}
        </div>

        <span className="text-zinc-700 hidden sm:inline">|</span>

        {/* Network fee paid - EXACTLY ONCE */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans text-zinc-400 font-medium shrink-0">Network fee paid:</span>
          <span
            className="font-mono font-semibold text-zinc-200"
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
        <div className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          {conciseStory}
        </div>
      )}

      {/* 5. Critical Limitation Notice if decoder coverage is partial */}
      {data.coverage === 'partial' && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs font-sans text-amber-200">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Note: Some internal contract actions or custom events require archive trace data and are
            not decoded by standard EVM schemas.
          </span>
        </div>
      )}
    </div>
  );
}
