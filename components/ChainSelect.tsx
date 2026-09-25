'use client';

import React from 'react';
import { Diamond, Hexagon, Layers, Network } from 'lucide-react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS } from '../lib/validation';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface ChainSelectProps {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

interface ChainVisualMeta {
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
  dotClass: string;
  iconClass: string;
  symbolBadgeClass: string;
}

const CHAIN_VISUALS: Record<SupportedChain, ChainVisualMeta> = {
  ethereum: {
    icon: Diamond,
    activeClass:
      'border-sky-500/50 bg-sky-950/30 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.12)] ring-1 ring-sky-500/30',
    dotClass: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.7)]',
    iconClass: 'text-sky-400',
    symbolBadgeClass: 'bg-sky-950/60 border-sky-500/30 text-sky-300',
  },
  bsc: {
    icon: Hexagon,
    activeClass:
      'border-amber-500/50 bg-amber-950/30 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/30',
    dotClass: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]',
    iconClass: 'text-amber-400',
    symbolBadgeClass: 'bg-amber-950/60 border-amber-500/30 text-amber-300',
  },
  polygon: {
    icon: Layers,
    activeClass:
      'border-violet-500/50 bg-violet-950/30 text-violet-100 shadow-[0_0_15px_rgba(167,139,250,0.12)] ring-1 ring-violet-500/30',
    dotClass: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.7)]',
    iconClass: 'text-violet-400',
    symbolBadgeClass: 'bg-violet-950/60 border-violet-500/30 text-violet-300',
  },
};

export function ChainSelect({ value, onChange, disabled = false }: ChainSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="chain-select"
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold"
        >
          <Network className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span>Select Network</span>
        </label>
        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
          EVM Chains
        </Badge>
      </div>

      {/* Hidden select for accessibility/testing while synced with state */}
      <select
        id="chain-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedChain)}
        disabled={disabled}
        className="sr-only"
        aria-label="Blockchain Network"
      >
        {SUPPORTED_CHAINS.map((chain) => (
          <option key={chain.id} value={chain.id}>
            {chain.name} ({chain.symbol})
          </option>
        ))}
      </select>

      {/* Modern Segmented Surface with Distinct Active States */}
      <div
        role="radiogroup"
        aria-label="Select EVM Blockchain Network"
        className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-surface-nested p-1.5 shadow-inner"
      >
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = value === chain.id;
          const meta = CHAIN_VISUALS[chain.id as SupportedChain] || CHAIN_VISUALS.ethereum;
          const IconComponent = meta.icon;

          return (
            <button
              key={chain.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && onChange(chain.id)}
              disabled={disabled}
              className={cn(
                'group relative flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-2 sm:px-3 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]',
                isSelected
                  ? meta.activeClass
                  : 'border-transparent bg-transparent text-muted-foreground hover:bg-surface-elevated/70 hover:text-foreground',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {/* Active / Status Dot */}
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0 transition-all duration-200',
                  isSelected
                    ? meta.dotClass
                    : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/70',
                )}
                aria-hidden="true"
              />

              <IconComponent
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-colors',
                  isSelected ? meta.iconClass : 'text-muted-foreground group-hover:text-foreground',
                )}
                aria-hidden="true"
              />

              {/* Responsive Text: full name on desktop, symbol on mobile */}
              <span className="hidden sm:inline font-sans font-medium text-foreground truncate">
                {chain.name}
              </span>
              <span className="sm:hidden font-mono font-semibold truncate text-foreground">
                {chain.symbol}
              </span>

              {/* Ticker badge for desktop */}
              <span
                className={cn(
                  'hidden sm:inline-flex items-center rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold transition-colors',
                  isSelected
                    ? meta.symbolBadgeClass
                    : 'bg-surface-elevated text-muted-foreground border border-border/40',
                )}
              >
                {chain.symbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
