'use client';

import React from 'react';
import { Diamond, Hexagon, Layers } from 'lucide-react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS } from '../lib/validation';
import { cn } from '../lib/utils';

interface ChainSelectProps {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

const CHAIN_ICONS: Record<SupportedChain, React.ComponentType<{ className?: string }>> = {
  ethereum: Diamond,
  bsc: Hexagon,
  polygon: Layers,
};

export function ChainSelect({ value, onChange, disabled = false }: ChainSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="chain-select"
          className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold"
        >
          Select Network
        </label>
        <span className="font-mono text-[11px] text-zinc-500">EVM Chains</span>
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

      {/* Modern Segmented Pill Control */}
      <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-1.5 shadow-inner">
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = value === chain.id;
          const IconComponent = CHAIN_ICONS[chain.id as SupportedChain] || Diamond;

          return (
            <button
              key={chain.id}
              type="button"
              onClick={() => !disabled && onChange(chain.id)}
              disabled={disabled}
              className={cn(
                'group flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2 text-xs font-medium transition-all duration-150 min-w-0 active:scale-[0.98]',
                isSelected
                  ? 'border border-zinc-700/90 bg-zinc-900 text-zinc-100 shadow-sm ring-1 ring-zinc-700/40'
                  : 'border border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full shrink-0 transition-colors',
                  isSelected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-zinc-600',
                )}
              />
              <IconComponent
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-colors',
                  isSelected ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400',
                )}
                aria-hidden="true"
              />
              <span className="hidden sm:inline font-sans truncate">{chain.name}</span>
              <span className="sm:hidden font-mono font-semibold truncate">{chain.symbol}</span>
              <span className="hidden sm:inline font-mono text-[10px] text-zinc-500">{chain.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
