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
      className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4">
        {/* Network Selector */}
        <ChainSelect value={chain} onChange={setChain} disabled={isLoading} />

        {/* Command Bar Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tx-hash-input"
              className="text-xs font-mono uppercase tracking-wider text-zinc-500"
            >
              Transaction Hash
            </label>
            <div className="flex items-center gap-2">
              {hash && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="font-mono text-xs text-zinc-500 transition hover:text-zinc-300 disabled:opacity-50"
                >
                  clear
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="flex items-center gap-1 font-mono text-xs text-zinc-400 transition hover:text-zinc-200 disabled:opacity-50"
              >
                <span>paste</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
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
              className={`w-full rounded-lg border bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-600 transition focus:outline-none focus:ring-1 ${
                clientError
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-zinc-800 focus:border-zinc-500 focus:ring-zinc-500'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
          </div>

          {clientError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>{clientError}</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || !hash.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-white active:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-zinc-950"
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
