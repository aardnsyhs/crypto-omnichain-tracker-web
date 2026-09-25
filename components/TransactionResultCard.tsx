'use client';

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
    <article className="w-full overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-2xl backdrop-blur-sm divide-y divide-border/60">
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
        <div className="p-5 sm:p-6 text-center bg-surface-nested/30">
          <p className="text-xs font-mono text-muted-foreground">
            Smart contract interaction executed without token transfers or approval grants.
          </p>
          <p className="mt-1 text-[11px] font-mono text-muted-foreground/80">
            Review calldata and execution logs in the technical details below.
          </p>
        </div>
      )}

      {/* 5. Collapsible Technical Ledger, Proofs, Decoder Coverage & Cache Diagnostics */}
      <TechnicalDetails data={data} meta={meta} />
    </article>
  );
}
