'use client';

import React from 'react';
import {
  Diamond,
  Bitcoin,
  Zap,
  CircleDot,
  Banknote,
  Gauge,
  Hexagon,
  Layers,
  Network,
} from 'lucide-react';
import type { SupportedChain } from '../lib/api-types';
import {
  ACTIVE_CHAINS,
  ALL_SUPPORTED_CHAINS,
  NETWORK_REGISTRY,
  isActiveChain,
} from '../lib/network-registry';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface ChainSelectProps {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

const CHAIN_ICONS: Record<SupportedChain, React.ComponentType<{ className?: string }>> = {
  ethereum: Diamond,
  bitcoin: Bitcoin,
  litecoin: Zap,
  dogecoin: CircleDot,
  'bitcoin-cash': Banknote,
  dash: Gauge,
  bsc: Hexagon,
  polygon: Layers,
};

export function ChainSelect({ value, onChange, disabled = false }: ChainSelectProps) {
  // If value is a legacy chain (bsc or polygon), ensure it can still be displayed
  const displayedChains: SupportedChain[] = isActiveChain(value)
    ? [...ACTIVE_CHAINS]
    : [value, ...ACTIVE_CHAINS];

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
          6 Active Networks
        </Badge>
      </div>

      {/* Hidden select for accessibility & form automation while synced with state */}
      <select
        id="chain-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedChain)}
        disabled={disabled}
        className="sr-only"
        aria-label="Blockchain Network"
      >
        {ALL_SUPPORTED_CHAINS.map((chain) => {
          const config = NETWORK_REGISTRY[chain];
          return (
            <option key={chain} value={chain}>
              {config.name} ({config.nativeSymbol})
            </option>
          );
        })}
      </select>

      {/* Responsive Segmented Surface with 6 Active Networks */}
      <div
        role="radiogroup"
        aria-label="Select Blockchain Network"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 rounded-xl border border-border/80 bg-surface-nested p-1.5 shadow-inner"
      >
        {displayedChains.map((chain) => {
          const isSelected = value === chain;
          const config = NETWORK_REGISTRY[chain];
          if (!config) return null;

          const IconComponent = CHAIN_ICONS[chain] || Network;
          const visuals = config.visuals;

          return (
            <button
              key={chain}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && onChange(chain)}
              disabled={disabled}
              className={cn(
                'group relative flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-150 active:scale-[0.98]',
                isSelected
                  ? visuals.activeCardClass
                  : 'border-transparent bg-transparent text-muted-foreground hover:bg-surface-elevated/70 hover:text-foreground',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {/* Status Dot */}
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0 transition-all duration-200',
                  isSelected
                    ? visuals.dotClass
                    : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/70',
                )}
                aria-hidden="true"
              />

              <IconComponent
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-colors',
                  isSelected ? visuals.iconClass : 'text-muted-foreground group-hover:text-foreground',
                )}
                aria-hidden="true"
              />

              {/* Responsive Text: full name on larger viewports, symbol on tight screens */}
              <span className="hidden xl:inline font-sans font-medium text-foreground truncate">
                {config.name}
              </span>
              <span className="xl:hidden font-mono font-semibold truncate text-foreground">
                {config.nativeSymbol}
              </span>

              {/* Ticker badge for large desktop */}
              <span
                className={cn(
                  'hidden xl:inline-flex items-center rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold transition-colors',
                  isSelected
                    ? visuals.tickerClass
                    : 'bg-surface-elevated text-muted-foreground border border-border/40',
                )}
              >
                {config.nativeSymbol}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
