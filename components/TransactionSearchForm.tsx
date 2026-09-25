'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, Clipboard, X, Check, Loader2 } from 'lucide-react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS, truncateHashOrAddress, validateLookupInput } from '../lib/validation';
import { ChainSelect } from './ChainSelect';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface TransactionSearchFormProps {
  initialChain?: SupportedChain;
  initialHash?: string;
  isLoading: boolean;
  isCondensed?: boolean;
  onToggleCondensed?: (condensed: boolean) => void;
  onSubmit: (chain: SupportedChain, transactionHash: string) => void;
}

export function TransactionSearchForm({
  initialChain = 'ethereum',
  initialHash = '',
  isLoading,
  isCondensed = false,
  onToggleCondensed,
  onSubmit,
}: TransactionSearchFormProps) {
  const [chain, setChain] = useState<SupportedChain>(initialChain);
  const [hash, setHash] = useState(initialHash);
  const [clientError, setClientError] = useState<string | null>(null);
  const [pastedFeedback, setPastedFeedback] = useState(false);

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
          setPastedFeedback(true);
          setTimeout(() => setPastedFeedback(false), 1500);
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

  if (isCondensed && hash) {
    const chainConfig = SUPPORTED_CHAINS.find((c) => c.id === chain) || SUPPORTED_CHAINS[0];
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5 shadow-lg border-zinc-800/90 sm:px-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700/60 bg-zinc-950 px-2.5 py-1 font-mono text-xs text-zinc-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{chainConfig.name}</span>
          </span>
          <span className="truncate font-mono text-xs text-zinc-400 select-all" title={hash}>
            {truncateHashOrAddress(hash, 12, 10)}
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onToggleCondensed?.(false)}
          className="gap-1.5"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span>New search</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6 shadow-xl border-zinc-800/90">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Network Selector */}
        <ChainSelect value={chain} onChange={setChain} disabled={isLoading} />

        {/* Command Bar Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tx-hash-input"
              className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold"
            >
              Transaction Hash
            </label>
            <div className="flex items-center gap-3">
              {hash && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 transition hover:text-zinc-300 disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  <span>clear</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center gap-1 font-mono text-xs transition-colors disabled:opacity-50',
                  pastedFeedback ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200',
                )}
              >
                {pastedFeedback ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>pasted</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3 w-3" />
                    <span>paste</span>
                  </>
                )}
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
              className={cn(
                'w-full rounded-lg border bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100 placeholder-zinc-600 transition-all focus:outline-none focus:ring-1',
                clientError
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'border-zinc-800 focus:border-zinc-500 focus:ring-zinc-400 hover:border-zinc-700',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            />
          </div>

          {clientError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <span>{clientError}</span>
            </p>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          type="submit"
          disabled={isLoading || !hash.trim()}
          size="lg"
          className="w-full gap-2 text-zinc-950"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Decoding on-chain transaction...</span>
            </>
          ) : (
            <>
              <span>Track Transaction</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
