'use client';

import React from 'react';
import { ApiClientError } from '../lib/api-errors';

interface LookupErrorStateProps {
  error: ApiClientError | Error | null;
  onRetry?: () => void;
}

export function LookupErrorState({ error, onRetry }: LookupErrorStateProps) {
  if (!error) return null;

  let title = 'Lookup Error';
  let description =
    error.message || 'An unexpected error occurred while looking up this transaction.';
  let badgeText = 'Error';
  let badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  let icon = '⚠️';
  let hint: string | null = null;
  let requestId = '';

  if (error instanceof ApiClientError) {
    requestId = error.requestId || '';

    switch (error.errorCode) {
      case 'TRANSACTION_NOT_FOUND':
        title = 'Transaction Not Found';
        description =
          'The specified transaction hash was not found on the selected network. It may not exist, might have been dropped from the mempool, or could belong to a different blockchain.';
        badgeText = 'HTTP 404';
        badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        icon = '🔍';
        hint = 'Tip: Confirm you selected the correct network (Ethereum, BSC, or Polygon).';
        break;

      case 'INVALID_TRANSACTION_HASH':
        title = 'Invalid Transaction Hash';
        description =
          'The provided transaction hash is malformed. EVM transaction hashes must start with "0x" followed by exactly 64 hexadecimal characters.';
        badgeText = 'HTTP 400';
        icon = '❌';
        break;

      case 'UNSUPPORTED_CHAIN':
        title = 'Unsupported Chain';
        description =
          'The selected chain is not supported. Please choose Ethereum, BNB Smart Chain, or Polygon.';
        badgeText = 'HTTP 400';
        icon = '🌐';
        break;

      case 'RATE_LIMIT_EXCEEDED':
        title = 'Rate Limit Reached';
        description =
          'You have exceeded the public rate limit of 30 lookups per minute. Please pause for a few seconds before trying again.';
        badgeText = 'HTTP 429';
        badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        icon = '⏳';
        hint = 'The rate limit resets every 60 seconds.';
        break;

      case 'UPSTREAM_RATE_LIMITED':
        title = 'Provider Rate Limited';
        description =
          'The upstream blockchain provider quota is temporarily exhausted. The service will recover shortly.';
        badgeText = 'HTTP 503';
        badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        icon = '🛑';
        hint = 'Please wait a moment and try your lookup again.';
        break;

      case 'UPSTREAM_TIMEOUT':
      case 'UPSTREAM_PROVIDER_ERROR':
        title = 'Upstream Provider Unavailable';
        description =
          'The blockchain data provider did not respond within the allocated timeout or experienced an internal issue.';
        badgeText = 'HTTP 502';
        icon = '📡';
        break;

      case 'NETWORK_ERROR':
        title = 'Connection Failed';
        description =
          'Could not establish a connection to the tracker API service. Please verify that the API server is online.';
        badgeText = 'Offline';
        icon = '🔌';
        break;

      default:
        badgeText = error.statusCode ? `HTTP ${error.statusCode}` : 'Error';
    }
  }

  return (
    <div
      role="alert"
      className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 font-mono text-sm text-zinc-300">
          {icon}
        </span>
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] font-medium ${badgeColor}`}
            >
              {badgeText}
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>

          {hint && <p className="mt-2 font-mono text-xs text-zinc-400">{hint}</p>}

          {requestId && (
            <p className="mt-3 font-mono text-[11px] text-zinc-500">
              Request ID: <span className="text-zinc-400">{requestId}</span>
            </p>
          )}

          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-800 px-3 py-1.5 font-mono text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
              >
                <span>Retry Lookup</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
