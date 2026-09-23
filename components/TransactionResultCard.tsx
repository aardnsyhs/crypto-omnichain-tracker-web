'use client';

import React from 'react';
import type { TransactionLookupResponse } from '../lib/api-types';
import { TransactionSummary } from './TransactionSummary';
import { AssetTransfers } from './AssetTransfers';
import { ApprovalDetails } from './ApprovalDetails';
import { TechnicalDetails } from './TechnicalDetails';

interface TransactionResultCardProps {
  response: TransactionLookupResponse;
}

export function TransactionResultCard({ response }: TransactionResultCardProps) {
  const { data, meta } = response;

  return (
    <article className="w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-xl backdrop-blur-sm">
      {/* 1. High-level Summary & Narrative Story */}
      <TransactionSummary data={data} />

      {/* 2. Transferred Assets (Native & Tokens) */}
      <AssetTransfers data={data} />

      {/* 3. Approval Grants (if any) */}
      {data.approvals && data.approvals.length > 0 && (
        <ApprovalDetails approvals={data.approvals} isFailed={data.status === 'failed'} />
      )}

      {/* 4. Collapsible Technical & Proof Details */}
      <TechnicalDetails data={data} meta={meta} />
    </article>
  );
}
