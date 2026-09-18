'use client';

import React, { useState } from 'react';
import type { SupportedChain } from '../lib/api-types';
import { validateLookupInput } from '../lib/validation';
import { ChainSelect } from './ChainSelect';

interface TransactionSearchFormProps {
  initialChain?: SupportedChain;
  initialHash?: string;
  isLoading: boolean;
  onSubmit: (chain: SupportedChain, transactionHash: string) => void;
}

export function TransactionSearchForm({
  initialChain = 'ethereum',
  initialHash = '',
  isLoading,
  onSubmit,
}: TransactionSearchFormProps) {
  const [chain, setChain] = useState<SupportedChain>(initialChain);
  const [hash, setHash] = useState(initialHash);
  const [clientError, setClientError] = useState<string | null>(null);

  // Sync state if props change (e.g. from clicking search history)
  React.useEffect(() => {
    if (initialChain) setChain(initialChain);
  }, [initialChain]);

  React.useEffect(() => {
    if (initialHash) setHash(initialHash);
  }, [initialHash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    const validation = validateLookupInput(chain, hash);
    if (!validation.isValid) {
      setClientError(validation.error || 'Please enter a valid EVM transaction hash.');
      return;
    }

    onSubmit(chain, hash.trim());
  };

  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setHash(text.trim());
          setClientError(null);
        }
      }
    } catch {
      // Permission denied or unsupported
    }
  };

  const handleClear = () => {
    setHash('');
    setClientError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur transition hover:border-slate-700"
    >
      <div className="flex flex-col gap-5">
        {/* Network Selector */}
        <ChainSelect value={chain} onChange={setChain} disabled={isLoading} />

        {/* Transaction Hash Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tx-hash-input"
              className="text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              {hash && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                <span>📋 Paste</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              id="tx-hash-input"
              type="text"
              value={hash}
              onChange={(e) => {
                setHash(e.target.value);
                if (clientError) setClientError(null);
              }}
              placeholder="0x..."
              disabled={isLoading}
              spellCheck={false}
              autoComplete="off"
              className={`w-full rounded-lg border bg-slate-950/90 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-600 shadow-inner transition focus:outline-none focus:ring-1 ${
                clientError
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
          </div>

          {clientError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
              <span>⚠️</span>
              <span>{clientError}</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || !hash.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/50 transition hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Querying Blockchain...</span>
            </>
          ) : (
            <>
              <span>Track Transaction</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
