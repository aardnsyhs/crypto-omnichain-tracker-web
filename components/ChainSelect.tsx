'use client';

import React from 'react';
import type { SupportedChain } from '../lib/api-types';
import { SUPPORTED_CHAINS } from '../lib/validation';

interface ChainSelectProps {
  value: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

export function ChainSelect({ value, onChange, disabled = false }: ChainSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="chain-select"
          className="text-xs font-mono uppercase tracking-wider text-zinc-500"
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

      {/* Segmented Control */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-800/80 bg-zinc-950 p-1">
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = value === chain.id;
          return (
            <button
              key={chain.id}
              type="button"
              onClick={() => !disabled && onChange(chain.id)}
              disabled={disabled}
              className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? 'border border-zinc-700/80 bg-zinc-900 text-zinc-100 shadow-sm'
                  : 'border border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  isSelected ? 'bg-emerald-400' : 'bg-zinc-600'
                }`}
              />
              <span className="truncate">{chain.name}</span>
              <span className="font-mono text-[10px] text-zinc-500">{chain.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
