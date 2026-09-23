'use client';

import React, { useState } from 'react';
import type { TransactionData } from '../lib/api-types';
import {
  copyToClipboard,
  formatReadableAmount,
  formatTimestamp,
  truncateHashOrAddress,
} from '../lib/validation';
import { CopyButton } from './CopyButton';

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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-xs font-semibold text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Failed (Reverted)
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending On-Chain
          </span>
        );
      case 'unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 font-mono text-xs font-semibold text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Unknown Status
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

  // Render hero content based on transaction type
  const renderHeroContent = () => {
    if (isFailed) {
      const feeFormatted = formatReadableAmount(data.fee?.formatted);
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-rose-400">
              Execution Reverted
            </span>
          </div>
          <div className="mt-1">
            <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">Transaction Reverted</h2>
            <p className="mt-1 text-sm text-zinc-400">
              The transaction execution failed on-chain and state changes were not applied.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs font-mono text-rose-300">
            <span>Network fee paid:</span>
            <span className="font-bold text-rose-200" title={feeFormatted.exact}>
              {feeFormatted.display} {data.fee.symbol}
            </span>
          </div>
        </div>
      );
    }

    if (isPureApproval) {
      const primaryApproval = approvals[0];
      const isUnlimited = primaryApproval.isUnlimited;
      const isRevocation = primaryApproval.isRevocation;
      const tokenSymbol = primaryApproval.symbol || 'ERC-20 Token';
      const formattedAmt = formatReadableAmount(primaryApproval.formattedAmount);

      return (
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-purple-400">
              Token Approval
            </span>
            <span className="text-xs font-mono text-zinc-400">{tokenSymbol}</span>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Approved Allowance
            </div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
              {isUnlimited ? (
                <span className="text-2xl font-extrabold text-amber-300 sm:text-3xl">
                  Maximum allowance
                </span>
              ) : isRevocation ? (
                <span className="text-2xl font-extrabold text-rose-300 sm:text-3xl">
                  Allowance Revoked (0)
                </span>
              ) : (
                <span
                  className="text-2xl font-extrabold text-zinc-100 sm:text-3xl"
                  title={formattedAmt.exact}
                >
                  {formattedAmt.display} {primaryApproval.symbol}
                </span>
              )}
              {isUnlimited && (
                <span className="font-mono text-xs text-amber-400/80">(2²⁵⁶ - 1 uint256)</span>
              )}
            </div>
          </div>

          {/* Prominently Highlight Spender (Beneficiary) with mobile-resilient width */}
          <div className="mt-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 min-w-0">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block">
                  Approved Spender (Beneficiary)
                </span>
                <div className="flex items-center justify-between gap-2 mt-1 min-w-0">
                  <span
                    className="font-mono text-xs sm:text-sm font-bold text-zinc-100 truncate min-w-0"
                    title={primaryApproval.spender}
                  >
                    {truncateHashOrAddress(primaryApproval.spender, 10, 8)}
                  </span>
                  <CopyButton text={primaryApproval.spender} label="spender" className="shrink-0" />
                </div>
              </div>
              <div className="min-w-0 pt-2 sm:pt-0 border-t border-purple-500/10 sm:border-0 sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Owner (Grantor)
                </span>
                <div className="flex items-center justify-between sm:justify-end gap-2 mt-1 min-w-0">
                  <span
                    className="font-mono text-xs text-zinc-300 truncate min-w-0"
                    title={primaryApproval.owner}
                  >
                    {truncateHashOrAddress(primaryApproval.owner, 8, 6)}
                  </span>
                  <CopyButton text={primaryApproval.owner} label="owner" className="shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isSingleTransfer) {
      if (hasNativeValue) {
        const valFormatted = formatReadableAmount(data.value.formatted);
        return (
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                Native Transfer
              </span>
              <span className="text-xs font-mono text-zinc-400">{data.value.symbol}</span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Transferred Nominal
              </div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight"
                  title={valFormatted.exact}
                >
                  {valFormatted.display} {data.value.symbol}
                </span>
                {valFormatted.isApproximate && (
                  <span className="font-mono text-xs text-zinc-400" title={valFormatted.exact}>
                    Exact: {valFormatted.exact} {data.value.symbol}
                  </span>
                )}
              </div>
            </div>

            {/* Sender and Recipient Highlight */}
            <div className="mt-1 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 min-w-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Sender (From)
                </span>
                <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                  <span className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0" title={data.from}>
                    {truncateHashOrAddress(data.from, 10, 8)}
                  </span>
                  <CopyButton text={data.from} label="from" className="shrink-0" />
                </div>
              </div>

              <div className="hidden sm:block text-zinc-500 font-mono text-sm px-2">➔</div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Recipient (To)
                </span>
                <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                  <span
                    className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0"
                    title={data.to || 'Contract'}
                  >
                    {data.to ? truncateHashOrAddress(data.to, 10, 8) : 'Contract Deployment'}
                  </span>
                  {data.to && <CopyButton text={data.to} label="to" className="shrink-0" />}
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Single ERC-20 transfer
        const t = tokenTransfers[0];
        const valFormatted = formatReadableAmount(t.formattedAmount);
        return (
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
                Token Transfer
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {t.name ? `${t.name} (${t.symbol || 'Token'})` : t.symbol || 'ERC-20'}
              </span>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Transferred Nominal
              </div>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                <span
                  className="text-3xl font-extrabold text-zinc-100 sm:text-4xl tracking-tight"
                  title={valFormatted.exact}
                >
                  {valFormatted.display} {t.symbol || ''}
                </span>
                {valFormatted.isApproximate && (
                  <span className="font-mono text-xs text-zinc-400" title={valFormatted.exact}>
                    Exact: {valFormatted.exact} {t.symbol || ''}
                  </span>
                )}
              </div>
            </div>

            {/* Sender and Recipient Highlight */}
            <div className="mt-1 flex flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 min-w-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Sender (From)
                </span>
                <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                  <span className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0" title={t.from}>
                    {truncateHashOrAddress(t.from, 10, 8)}
                  </span>
                  <CopyButton text={t.from} label="from" className="shrink-0" />
                </div>
              </div>

              <div className="hidden sm:block text-zinc-500 font-mono text-sm px-2">➔</div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Recipient (To)
                </span>
                <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5 min-w-0">
                  <span className="font-mono text-xs font-medium text-zinc-200 truncate min-w-0" title={t.to}>
                    {truncateHashOrAddress(t.to, 10, 8)}
                  </span>
                  <CopyButton text={t.to} label="to" className="shrink-0" />
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    if (isMultiTransfer) {
      return (
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-teal-400">
              Multi-Asset Transfer
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {totalTransfers} Movements Detected
            </span>
          </div>

          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Primary Action
            </div>
            <div className="mt-0.5">
              <span className="text-2xl font-extrabold text-zinc-100 sm:text-3xl">
                {totalTransfers} Asset Transfers
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Multiple tokens were transferred in this transaction. See the structured movement flow
              below.
            </p>
          </div>
        </div>
      );
    }

    // Default: Contract interaction without direct transfers or approvals
    return (
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            Contract Interaction
          </span>
        </div>

        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Action Target
          </div>
          <div className="mt-0.5 flex items-center justify-between sm:justify-start gap-2 min-w-0">
            <span className="text-lg sm:text-2xl font-bold text-zinc-100 truncate min-w-0">
              {data.to ? truncateHashOrAddress(data.to, 12, 10) : 'Contract Deployment'}
            </span>
            {data.to && <CopyButton text={data.to} label="contract" className="shrink-0" />}
          </div>
        </div>
      </div>
    );
  };

  const feeFormatted = formatReadableAmount(data.fee?.formatted);

  // Derive concise, data-driven narrative without giant repetitive paragraphs
  const getConciseStory = () => {
    if (isFailed) {
      return null; // Omit narrative box entirely for failed tx to eliminate repetition
    }

    if (isMultiTransfer) {
      const uniqueAssets = Array.from(
        new Set([
          hasNativeValue ? data.value.symbol : null,
          ...tokenTransfers.map((t) => t.symbol),
        ].filter(Boolean)),
      );
      return `${totalTransfers} asset movement${totalTransfers === 1 ? '' : 's'}${
        approvals.length > 0
          ? ` and ${approvals.length} token approval${approvals.length === 1 ? '' : 's'}`
          : ''
      } recorded on-chain across ${uniqueAssets.length} unique asset${uniqueAssets.length === 1 ? '' : 's'}.`;
    }

    if (isPureApproval) {
      const a = approvals[0];
      const allowanceDesc = a.isUnlimited
        ? 'maximum allowance'
        : a.isRevocation
          ? '0 allowance (revoked)'
          : `${formatReadableAmount(a.formattedAmount).display} ${a.symbol || ''}`;
      return `Authorized ${truncateHashOrAddress(a.spender, 8, 6)} for ${allowanceDesc} in block #${data.blockNumber}.`;
    }

    return data.explanation;
  };

  const conciseStory = getConciseStory();

  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {getStatusBadge()}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-xs font-medium text-zinc-300">
            {getChainLabel()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-800/80 px-2.5 py-1 font-mono text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
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

      {/* Hero Section */}
      <div className="rounded-xl border border-zinc-800/90 bg-zinc-950/80 p-5 sm:p-6 shadow-inner">
        {renderHeroContent()}
      </div>

      {/* Transaction Narrative Explanation (Deduplicated, suppressed on failed) */}
      {conciseStory && (
        <div className="mt-4 rounded-lg border border-zinc-800/60 bg-zinc-950/30 p-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            Transaction Summary
          </div>
          <p className="text-sm sm:text-base font-normal text-zinc-200 leading-relaxed">
            {conciseStory}
          </p>
        </div>
      )}

      {/* Critical Limitation Notice if decoder coverage is partial */}
      {data.coverage === 'partial' && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] font-mono text-amber-300">
          <span className="shrink-0">ℹ️</span>
          <span>
            Note: Some contract internal actions or custom events require trace data and are not decoded by standard EVM decoders.
          </span>
        </div>
      )}

      {/* Quick Details Bar: Network Fee Paid & Block Height (Fee omitted here on failed tx since hero already highlights it) */}
      <div className={`mt-3 grid grid-cols-1 gap-2.5 ${isFailed ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`}>
        {!isFailed && (
          <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/50 bg-zinc-950/20 px-3.5 py-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Network fee paid
            </span>
            <span className="font-mono text-sm font-semibold text-zinc-100" title={feeFormatted.exact}>
              {feeFormatted.display} {data.fee.symbol}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1 rounded-lg border border-zinc-800/50 bg-zinc-950/20 px-3.5 py-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Block Height & Time
          </span>
          <div className="flex flex-wrap items-baseline gap-1.5 font-mono text-xs text-zinc-300">
            <span className="font-semibold text-zinc-100">#{data.blockNumber}</span>
            <span className="text-zinc-600">•</span>
            <span>{data.timestamp ? formatTimestamp(data.timestamp) : 'Recent'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
