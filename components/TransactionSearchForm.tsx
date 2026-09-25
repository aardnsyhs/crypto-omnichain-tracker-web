'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, Clipboard, X, Check, Loader2, Hash, AlertCircle } from 'lucide-react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS, truncateHashOrAddress, validateLookupInput } from '../lib/validation';
import { ChainSelect } from './ChainSelect';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
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
    const chainBadgeClasses =
      chain === 'ethereum'
        ? 'border-sky-500/40 bg-sky-950/30 text-sky-200'
        : chain === 'bsc'
          ? 'border-amber-500/40 bg-amber-950/30 text-amber-200'
          : 'border-violet-500/40 bg-violet-950/30 text-violet-200';
    const chainDotClass =
      chain === 'ethereum'
        ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]'
        : chain === 'bsc'
          ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]'
          : 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.7)]';

    return (
      <Card className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 border-border/80 bg-card/95 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium',
              chainBadgeClasses,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', chainDotClass)} />
            <span>{chainConfig.name}</span>
          </span>
          <span className="truncate font-mono text-xs text-foreground/90 select-all" title={hash}>
            {truncateHashOrAddress(hash, 12, 10)}
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onToggleCondensed?.(false)}
          className="gap-1.5 text-xs font-sans"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span>New search</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6 border-border/80 bg-card/95 backdrop-blur-sm shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Network Selector */}
        <ChainSelect value={chain} onChange={setChain} disabled={isLoading} />

        {/* Transaction Hash Command Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="tx-hash-input"
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold"
            >
              <Hash className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span>Transaction Hash</span>
            </label>

            <div className="flex items-center gap-2">
              {hash && (
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    onClick={handleClear}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                    aria-label="Clear hash input"
                  >
                    <X className="h-3 w-3" />
                    <span>clear</span>
                  </TooltipTrigger>
                  <TooltipContent>Clear input</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={handlePaste}
                  disabled={isLoading}
                  className={cn(
                    'inline-flex items-center gap-1 font-mono text-xs transition-colors disabled:opacity-40',
                    pastedFeedback
                      ? 'text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  aria-label="Paste hash from clipboard"
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
                </TooltipTrigger>
                <TooltipContent>Paste from clipboard</TooltipContent>
              </Tooltip>
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
                'w-full rounded-lg border bg-surface-nested px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-2',
                clientError
                  ? 'border-destructive/80 focus:border-destructive focus:ring-destructive/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                  : 'border-border/80 focus:border-primary focus:ring-ring/40 hover:border-border',
                isLoading && 'cursor-not-allowed opacity-50',
              )}
            />
          </div>

          {clientError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-rose-400 font-mono">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{clientError}</span>
            </p>
          )}
        </div>

        {/* Primary Action Button */}
        <Button
          type="submit"
          disabled={isLoading || !hash.trim()}
          size="lg"
          className={cn(
            'w-full gap-2 min-h-[44px] font-semibold text-sm transition-all duration-150',
            hash.trim() && !isLoading
              ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-[0.99]'
              : 'border border-primary/25 bg-primary/10 text-primary/60 opacity-100 shadow-none cursor-not-allowed',
          )}
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
