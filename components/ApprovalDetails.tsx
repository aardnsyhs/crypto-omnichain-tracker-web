'use client';

import React from 'react';
import type { TokenApprovalItem } from '../lib/api-types';
import { truncateHashOrAddress } from '../lib/validation';

interface ApprovalDetailsProps {
  approvals: TokenApprovalItem[];
  isFailed?: boolean;
}

export function ApprovalDetails({ approvals, isFailed }: ApprovalDetailsProps) {
  if (!approvals || approvals.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-zinc-800/80 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Token Approvals
        </h3>
        <span className="font-mono text-xs text-zinc-500">
          {approvals.length} grant/allowance event(s)
        </span>
      </div>

      {isFailed ? (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="font-mono text-xs text-rose-300">
            Approval call failed and was not recorded on-chain.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((item, idx) => (
            <div
              key={`${item.tokenAddress}-${item.spender}-${item.logIndex}-${idx}`}
              className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/50 pb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-purple-400">
                    Approval
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-200">
                    {item.name
                      ? `${item.name} (${item.symbol || '???'})`
                      : item.symbol || 'ERC-20 Token'}
                  </span>
                </div>

                <div>
                  {item.isRevocation ? (
                    <span className="inline-flex items-center rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-rose-400">
                      Allowance Revoked (0)
                    </span>
                  ) : item.isUnlimited ? (
                    <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-amber-300">
                      Maximum Allowance (2²⁵⁶-1)
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-zinc-100">
                      {item.formattedAmount !== null
                        ? `${item.formattedAmount} ${item.symbol || ''}`
                        : `${item.rawAmount} raw units`}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Owner (Grantor)
                  </span>
                  <span className="font-mono text-zinc-300" title={item.owner}>
                    {truncateHashOrAddress(item.owner, 8, 6)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Spender (Beneficiary)
                  </span>
                  <span className="font-mono text-zinc-300" title={item.spender}>
                    {truncateHashOrAddress(item.spender, 8, 6)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-500 block">
                    Token Contract
                  </span>
                  <span className="font-mono text-zinc-400 text-[11px]" title={item.tokenAddress}>
                    {truncateHashOrAddress(item.tokenAddress, 8, 6)}
                  </span>
                </div>
              </div>

              {item.isUnlimited && (
                <p className="mt-2.5 text-[11px] font-mono text-zinc-400 leading-normal">
                  Note: Granted uint256 maximum allowance. Standard token implementations treat this
                  as an unlimited spending permission.
                </p>
              )}
            </div>
          ))}

          {/* Historical Scope Disclaimer */}
          <div className="rounded border border-zinc-800/80 bg-zinc-950/30 p-2.5 text-center">
            <p className="text-[11px] font-mono text-zinc-500">
              ℹ️ Historical transaction grant. This reflects the allowance approved during this
              transaction and does not guarantee current live allowance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
