'use client';

import React from 'react';
import type { TokenApprovalItem } from '../lib/api-types';
import { formatReadableAmount, truncateHashOrAddress } from '../lib/validation';
import { CopyButton } from './CopyButton';

interface ApprovalDetailsProps {
  approvals: TokenApprovalItem[];
  isFailed?: boolean;
  isHeroDisplayingApproval?: boolean;
}

export function ApprovalDetails({
  approvals,
  isFailed,
  isHeroDisplayingApproval = false,
}: ApprovalDetailsProps) {
  if (!approvals || approvals.length === 0 || isFailed) {
    return null;
  }

  // Deduplicate only when the single approval's owner/spender/allowance is already displayed in hero
  if (isHeroDisplayingApproval && approvals.length === 1) {
    const item = approvals[0];
    return (
      <div className="border-b border-zinc-800/80 p-5 sm:p-6 min-w-0">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Token Contract & Log Details
          </h3>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-purple-300">
            Log #{item.logIndex}
          </span>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4 min-w-0 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Target Token Contract
              </span>
              <div className="flex items-center justify-between sm:justify-start gap-2 mt-1 min-w-0">
                <span
                  className="font-mono text-xs sm:text-sm font-semibold text-zinc-100 truncate min-w-0 select-all"
                  title={item.tokenAddress}
                >
                  {truncateHashOrAddress(item.tokenAddress, 12, 10)}
                </span>
                <CopyButton text={item.tokenAddress} label="token contract" className="shrink-0" />
              </div>
            </div>

            <div className="text-left sm:text-right min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Token Identity
              </span>
              <div className="font-mono text-xs text-zinc-300 mt-1">
                {item.name ? `${item.name} (${item.symbol || '???'})` : item.symbol || 'ERC-20'}
                {item.decimals !== null && (
                  <span className="text-zinc-500 ml-1.5">• {item.decimals} decimals</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400">
            <span>Proof Source: EVM Receipt Log ({item.logIndex})</span>
            <span>Signature: Approval(address,address,uint256)</span>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[11px] text-zinc-500">
          ℹ️ Historical allowance grant: Reflects the allowance authorized on-chain in this transaction.
        </p>
      </div>
    );
  }

  // Multiple Approvals: Render structured list of all approval items
  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6 min-w-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Token Approvals
          </h3>
          <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[11px] font-medium text-purple-300">
            {approvals.length} Grants
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800/80 bg-zinc-950/40 min-w-0">
        {approvals.map((item, idx) => {
          const val = formatReadableAmount(item.formattedAmount);

          return (
            <div
              key={`${item.tokenAddress}-${item.spender}-${item.logIndex}-${idx}`}
              className="p-4 sm:p-5 min-w-0"
            >
              {/* Token & Allowance Nominal */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex shrink-0 items-center rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-purple-400">
                    Approval #{idx + 1}
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-100 truncate min-w-0">
                    {item.name ? `${item.name} (${item.symbol || '???'})` : item.symbol || 'ERC-20 Token'}
                  </span>
                </div>

                <div className="min-w-0 text-right">
                  {item.isRevocation ? (
                    <span className="inline-flex shrink-0 items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-bold text-rose-300">
                      Allowance Revoked (0)
                    </span>
                  ) : item.isUnlimited ? (
                    <span className="inline-flex shrink-0 items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-300">
                      Maximum allowance (2²⁵⁶-1)
                    </span>
                  ) : (
                    <div>
                      <div className="font-mono text-sm sm:text-base font-bold text-zinc-100" title={val.exact}>
                        {item.formattedAmount !== null
                          ? `${val.display} ${item.symbol || ''}`
                          : `${item.rawAmount} raw units`}
                      </div>
                      {val.isApproximate && item.formattedAmount !== null && (
                        <div className="text-[11px] font-mono text-zinc-400" title={val.exact}>
                          Exact: {val.exact} {item.symbol || ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Spender & Owner Callout */}
              <div className="mt-2 grid grid-cols-1 gap-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 min-w-0 sm:grid-cols-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block">
                    Approved Spender (Beneficiary)
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-2 mt-1 min-w-0">
                    <span
                      className="font-mono text-xs sm:text-sm font-bold text-zinc-100 truncate min-w-0 select-all"
                      title={item.spender}
                    >
                      {truncateHashOrAddress(item.spender, 10, 8)}
                    </span>
                    <CopyButton text={item.spender} label="spender" className="shrink-0" />
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Owner (Grantor)
                  </span>
                  <div className="flex items-center justify-between sm:justify-start gap-2 mt-1 min-w-0">
                    <span
                      className="font-mono text-xs text-zinc-200 truncate min-w-0 select-all"
                      title={item.owner}
                    >
                      {truncateHashOrAddress(item.owner, 10, 8)}
                    </span>
                    <CopyButton text={item.owner} label="owner" className="shrink-0" />
                  </div>
                </div>
              </div>

              {/* Token Contract Reference */}
              <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-zinc-400 min-w-0">
                <span className="text-[11px] text-zinc-400 shrink-0">Token Contract:</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-zinc-300 text-[11px] truncate min-w-0" title={item.tokenAddress}>
                    {truncateHashOrAddress(item.tokenAddress, 10, 8)}
                  </span>
                  <CopyButton text={item.tokenAddress} label="contract" className="shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center font-mono text-[11px] text-zinc-500">
        ℹ️ Historical allowance grant: Reflects the allowance authorized on-chain in this transaction.
      </p>
    </div>
  );
}
