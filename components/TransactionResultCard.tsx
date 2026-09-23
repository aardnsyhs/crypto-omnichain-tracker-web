'use client';

import React from 'react';
import type { TransactionLookupResponse } from '../lib/api-types';
import { TransactionSummary } from './TransactionSummary';
import { MovingAssetsSummary } from './MovingAssetsSummary';
import { AssetTransfers } from './AssetTransfers';
import { ApprovalDetails } from './ApprovalDetails';
import { TechnicalDetails } from './TechnicalDetails';

interface TransactionResultCardProps {
  response: TransactionLookupResponse;
}

export function TransactionResultCard({ response }: TransactionResultCardProps) {
  const { data, meta } = response;

  const isFailed = data.status === 'failed';
  const hasNativeValue =
    Boolean(data.value?.raw) && data.value.raw !== '0' && data.value.raw !== '0x0';
  const tokenTransfers = data.tokenTransfers || [];
  const approvals = data.approvals || [];
  const hasTransfers = hasNativeValue || tokenTransfers.length > 0;
  const hasApprovals = approvals.length > 0;

  const isPureApproval = !hasTransfers && approvals.length === 1;

  return (
    <article className="w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950 text-zinc-100 shadow-2xl divide-y divide-zinc-800/60">
      {/* Tier 1: Primary Action & Executive Summary */}
      <TransactionSummary data={data} />

      {/* Tier 2: Moving Assets Summary (Neutral token overview for multi-transfers) */}
      {!isFailed && hasTransfers && <MovingAssetsSummary data={data} />}

      {/* Tier 3: Sequential Transfer Ledger */}
      {!isFailed && hasTransfers && <AssetTransfers data={data} />}

      {/* Tier 3 Continuation: Token Approval Details */}
      {!isFailed && hasApprovals && (
        <ApprovalDetails approvals={approvals} isHeroDisplayingApproval={isPureApproval} />
      )}

      {/* 4. Pure Contract Call (no transfers and no approvals) */}
      {!isFailed && !hasTransfers && !hasApprovals && (
        <div className="border-b border-zinc-800/80 p-5 sm:p-6 text-center">
          <p className="text-xs font-mono text-zinc-400">
            Smart contract interaction executed without token transfers or approval grants.
          </p>
          <p className="mt-1 text-[11px] font-mono text-zinc-500">
            Review calldata and execution logs in the technical details below.
          </p>
        </div>
      )}

      {/* 5. Collapsible Technical Ledger, Proofs, Decoder Coverage & Cache Diagnostics */}
      <TechnicalDetails data={data} meta={meta} />
    </article>
  );
}
