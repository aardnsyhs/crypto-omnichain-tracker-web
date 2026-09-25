'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { TokenApprovalItem } from '../lib/api-types';
import { formatReadableAmount, truncateHashOrAddress } from '../lib/validation';
import { CopyButton } from './CopyButton';
import { Badge } from './ui/badge';

interface ApprovalDetailsProps {
  approvals: TokenApprovalItem[];
  isFailed?: boolean;
  isHeroDisplayingApproval?: boolean;
}

export function ApprovalDetails({
  approvals,
  isFailed,
}: ApprovalDetailsProps) {
  if (!approvals || approvals.length === 0 || isFailed) {
    return null;
  }

  const isSingle = approvals.length === 1;

  return (
    <section aria-label="Token approvals" className="p-5 sm:p-6 min-w-0">
      <div className="mb-4 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-sans">
            {isSingle ? 'Token approval' : 'Token approvals'}
          </h3>
          <Badge variant="warning" className="font-mono text-[11px]">
            {approvals.length} {isSingle ? 'approval' : 'approvals'}
          </Badge>
        </div>
      </div>

      <div className="divide-y divide-zinc-850/60 rounded-xl border border-zinc-800/80 bg-zinc-950/80 min-w-0 overflow-hidden shadow-sm">
        {approvals.map((item, idx) => {
          const val = formatReadableAmount(item.formattedAmount);

          return (
            <div
              key={`${item.tokenAddress}-${item.spender}-${item.logIndex}-${idx}`}
              className="p-4 sm:p-5 min-w-0 flex flex-col gap-3"
            >
              {/* Header: Token Name & Allowance Nominal */}
              <div className="flex flex-wrap items-center justify-between gap-2 min-w-0 pb-2.5 border-b border-zinc-850/60">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="warning" className="text-xs font-semibold font-sans">
                    Approval #{idx + 1}
                  </Badge>
                  <span className="font-sans text-sm font-bold text-zinc-100 truncate min-w-0">
                    {item.name ? `${item.name} (${item.symbol || '???'})` : item.symbol || 'ERC-20 Token'}
                  </span>
                  {item.logIndex !== undefined && (
                    <span className="font-mono text-xs text-zinc-500">
                      (Log #{item.logIndex})
                    </span>
                  )}
                </div>

                <div className="min-w-0 text-right ml-auto">
                  {item.isRevocation ? (
                    <Badge variant="destructive" className="font-sans text-xs font-bold">
                      Allowance revoked (0)
                    </Badge>
                  ) : item.isUnlimited ? (
                    <Badge variant="warning" className="font-sans text-xs font-bold">
                      Maximum allowance (2²⁵⁶ - 1)
                    </Badge>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-zinc-100" title={val.exact}>
                        {item.formattedAmount !== null
                          ? `${val.display} ${item.symbol || ''}`
                          : `${item.rawAmount} raw units`}
                      </span>
                      {val.isApproximate && item.formattedAmount !== null && (
                        <CopyButton
                          text={val.exact}
                          label="exact allowance"
                          iconOnly
                          className="shrink-0"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Explicitly Display: Approved spender and Token owner with full copy buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs min-w-0">
                {/* Approved Spender */}
                <div className="flex flex-col gap-1 min-w-0 rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5">
                  <span className="font-sans text-[11px] text-zinc-400 font-medium">
                    Approved spender:
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 min-w-0">
                    <span
                      className="font-mono text-zinc-100 font-semibold truncate min-w-0 select-all"
                      title={item.spender}
                    >
                      {truncateHashOrAddress(item.spender, 6, 4)}
                    </span>
                    <CopyButton text={item.spender} label="approved spender address" iconOnly />
                  </div>
                </div>

                {/* Token Owner */}
                <div className="flex flex-col gap-1 min-w-0 rounded-lg bg-zinc-900/60 border border-zinc-800 p-2.5">
                  <span className="font-sans text-[11px] text-zinc-400 font-medium">
                    Token owner:
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 min-w-0">
                    <span
                      className="font-mono text-zinc-200 font-semibold truncate min-w-0 select-all"
                      title={item.owner}
                    >
                      {truncateHashOrAddress(item.owner, 6, 4)}
                    </span>
                    <CopyButton text={item.owner} label="token owner address" iconOnly />
                  </div>
                </div>
              </div>

              {/* Token Contract Reference & Log Proof */}
              <div className="pt-2 border-t border-zinc-850/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-sans text-zinc-500 shrink-0">Token contract:</span>
                  <span className="font-mono text-zinc-400 text-xs truncate min-w-0 select-all" title={item.tokenAddress}>
                    {truncateHashOrAddress(item.tokenAddress, 6, 4)}
                  </span>
                  <CopyButton text={item.tokenAddress} label="token contract address" iconOnly />
                  {item.decimals !== null && (
                    <span className="text-zinc-600 font-mono text-[11px] hidden xs:inline">• {item.decimals} decimals</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-sans ml-auto">
                  <span>Proof: EVM receipt log ({item.logIndex})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center font-sans text-[11px] text-zinc-500">
        Historical approval recorded in this transaction. The current allowance may differ.
      </p>
    </section>
  );
}
